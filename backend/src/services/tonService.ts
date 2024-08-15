import { Cell, HttpApi, TonClient, WalletContractV4, fromNano, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import dotenv from 'dotenv';
//import { updateUserBalance } from "./balanceService.js";
import Big from 'big.js'; // Import Big.js
import jwt from 'jsonwebtoken';
import ShopService from "./ShopService.js";
import { updateUserBalance } from "./balanceService.js";
import { sendNotificationToUser } from "./messageService.js";
//import TaskService from "./TaskService.js";
import sequelize from "../database/db.js";
import TransactionState from "../database/model/tonServiceModel.js"
import { Transaction } from "sequelize";

dotenv.config();


//const providerUrl = 'https://toncenter.com/api/v2/jsonRPC';
//const apiKey = process.env.TON_API_KEY; // Replace with your TON center API key
let lastCheckedLt: string = '47978777000003'; // This could be initialized from a persistent store
// Replace these with your actual keys
const publicKeyHex = process.env.TON_PUBLIC_KEY_HEX || '';
const secretKeyHex = process.env.TON_PRIVATE_KEY_HEX || '';

const publicKey = Buffer.from(publicKeyHex, "hex");
const secretKey = Buffer.from(secretKeyHex, "hex");

const wallet = WalletContractV4.create({ publicKey: publicKey, workchain: 0 });
const endpoint = await getHttpEndpoint({ network: "mainnet" });
const client = new TonClient({ endpoint, apiKey: process.env.TON_API_KEY });
const httpApi = new HttpApi(endpoint);
const walletContract = client.open(wallet);

export const createTransaction = async (amount: number, walletAddress: string) => {
  const seqno = await walletContract.getSeqno();
  console.log('seqno:', seqno);
  console.log('my wallet addr:', wallet.address.toString());
  const balance = await client.getBalance(wallet.address);
  console.log('current balance:', fromNano(balance));
  console.log('amount to withdraw', amount);
  const amountAfterFee = amount - 0.05;
  console.log('amount to withdraw minus fee:', amountAfterFee);
  if (seqno === undefined) {
    throw new Error('Failed to retrieve seqno');
  }
  /* if (!TonWeb.default.utils.Address.isValid(walletAddress)) {
     throw new Error('receiver wallet address is incorrect!');
   }*/

  const transfer = walletContract.createTransfer({
    seqno,
    secretKey: secretKey,
    messages: [
      internal({
        to: walletAddress,
        value: amountAfterFee.toString(),
        body: "Hello",
        bounce: false
      })
    ]
  });


  return transfer;
};

export const confirmTransaction = async (transfer: Cell) => {
  try {
    walletContract.send(transfer);

    //await transfer.send();
    console.log('transfer', transfer);
    return true;
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
};


// Function to fetch and process transactions since the last checked logical time
async function fetchAndProcessTransactions(toLT: string, dbTx?: Transaction): Promise<void> {

  let lastProcessedTxLt: string | undefined = undefined;
  let lastProcessedTxHash: string | undefined = undefined;
  let firstProcessedTxLt: string | undefined = undefined;
  const blockSize = 15;
  let response = undefined;
  do {
    response = await httpApi.getTransactions(wallet.address, { limit: blockSize, lt: lastProcessedTxLt, hash: lastProcessedTxHash, to_lt: toLT, inclusive: true });
    if (!response || response.length == 0) break;
    const filteredTransactions = response;
    if (!firstProcessedTxLt) {
      firstProcessedTxLt = filteredTransactions[0].transaction_id.lt;
    }
    let skipFirstTx: boolean = lastProcessedTxLt !== undefined;

    for (const transaction of filteredTransactions) {
      if (skipFirstTx) {
        skipFirstTx = false;
        continue;
      }
      lastProcessedTxLt = transaction.transaction_id.lt;
      lastProcessedTxHash = transaction.transaction_id.hash;
      if (transaction.out_msgs.length > 0
        || !transaction.in_msg
        || !transaction.in_msg.message
        || lastProcessedTxLt === lastCheckedLt) continue;
        const txValue = new Big(fromNano(transaction.in_msg.value));
        const payloadEncrypted = transaction.in_msg.message

        jwt.verify(payloadEncrypted, process.env.JWT_SECRET_KEY || '', async (err, payloadDecrypted) => {
          if (err || !payloadDecrypted) {
            return;
          }
          console.log('Decoded Data:', payloadDecrypted);
          if (typeof payloadDecrypted === 'string') {
            throw new Error('Unexpected token format');
          }
          const tag = payloadDecrypted['tag'];
          if (tag === 'TONBTL') {
            const userId = payloadDecrypted['userId'];
            const itemId = payloadDecrypted['itemId'];
            const taskId = payloadDecrypted['taskId'];
            const cost = payloadDecrypted['cost'];
            console.log(userId, itemId, cost);
            if (userId) {
              if (taskId) {
                const expectedCost = new Big(cost);
                if (expectedCost.eq(txValue)) {
                  //await TaskService.completeTask(taskId, userId, true);
                } else {
                  console.log('wrong tx amount: ', txValue, expectedCost);
                }
              } else if (itemId) {
                const expectedCost = new Big(cost);
                if (expectedCost.eq(txValue)) {
                  await ShopService.giveGoods(userId, itemId, dbTx);
                } else {
                  console.log('wrong tx amount: ', txValue, expectedCost);
                }
              } else {
                await updateUserBalance(userId, txValue, dbTx);
                sendNotificationToUser(userId, { message: `Successful top up: ${txValue.toFixed(9)} TON` });
              }
            } else {
              console.log('unknown user Id');
            }

          }
        });
    }
  } while (response.length == blockSize);

  if (firstProcessedTxLt) {
    lastCheckedLt = firstProcessedTxLt;
  }
  console.log('processing finished');

}


// Function to process incoming transactions
async function processIncomingTransactions() {
  const transaction = await sequelize.transaction();
  try {


    console.log('trying to get exclusive lock');
    //await sequelize.query('LOCK TABLE "transaction_state" IN EXCLUSIVE MODE', { transaction });
    console.log('got lock');
    let lastCheckedLtRow = await TransactionState.findOne({
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!lastCheckedLtRow) {
      // Insert lastCheckedLt if it doesn't exist
      lastCheckedLtRow = await TransactionState.create({
        lastCheckedLt: lastCheckedLt,
      }, { transaction });
    } else {
      // Use the existing lastCheckedLt from the database
      //lastCheckedLt = lastCheckedLtRow.lastCheckedLt;
    }
    console.log('got last value', lastCheckedLt);
    if (lastCheckedLt === '-1') {
      await fetchAndProcessTransactions(lastCheckedLt, transaction);
    } else {
      lastCheckedLt = lastCheckedLt + '1'
      console.log(lastCheckedLt + '1');
    }
    console.log('saving new value', lastCheckedLt);
    await lastCheckedLtRow.reload({ transaction });
    lastCheckedLtRow.set('lastCheckedLt', lastCheckedLt);
    lastCheckedLtRow.changed('lastCheckedLt', true); // Explicitly mark it as changed
    lastCheckedLtRow = await lastCheckedLtRow.save({ transaction });
    console.log('New lastCheckedLt saved:', lastCheckedLtRow.lastCheckedLt);
    await transaction.commit();
    console.log('commited');

  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error) {
      console.log(error.message);
    }

    console.error('Error processing transactions');
  }
}


// Schedule the processIncomingTransactions function to run every 15 seconds
setInterval(processIncomingTransactions, 15000);