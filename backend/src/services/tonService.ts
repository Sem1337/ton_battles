import { Cell, HttpApi, TonClient, WalletContractV4, fromNano, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import dotenv from 'dotenv';
//import { updateUserBalance } from "./balanceService.js";
import Big from 'big.js'; // Import Big.js
import jwt from 'jsonwebtoken';
import ShopService from "./ShopService.js";
import { updateUserBalance } from "./balanceService.js";
import { sendMessageToUser } from "./messageService.js";
import TaskService from "./TaskService.js";

dotenv.config();


//const providerUrl = 'https://toncenter.com/api/v2/jsonRPC';
//const apiKey = process.env.TON_API_KEY; // Replace with your TON center API key
let lastCheckedLt: string = '47539854000003'; // This could be initialized from a persistent store
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
async function fetchAndProcessTransactions(toLT: string): Promise<void> {

  let lastProcessedTxLt: string | undefined = undefined;
  let lastProcessedTxHash: string | undefined = undefined;
  let firstProcessedTxLt: string | undefined = undefined;
  const blockSize = 3;
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
      console.log('-----tx-----', transaction.transaction_id.lt);
      if (transaction.out_msgs.length > 0
        || !transaction.in_msg
        || !transaction.in_msg.message
        || lastProcessedTxLt === lastCheckedLt) continue;
      try {
        const txValue = new Big(fromNano(transaction.in_msg.value));
        console.log('amount: ', txValue);
        console.log('msg: ', transaction.in_msg.message);
        const payloadEncrypted = transaction.in_msg.message

        const payloadDecrypted = jwt.verify(payloadEncrypted, process.env.JWT_SECRET_KEY || '');
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
                await TaskService.completeTask(taskId, userId, true);
              } else {
                console.log('wrong tx amount: ', txValue, expectedCost);
              }
            } else if (itemId) {
              const expectedCost = new Big(cost);
              if (expectedCost.eq(txValue)) {
                await ShopService.giveGoods(userId, itemId);
              } else {
                console.log('wrong tx amount: ', txValue, expectedCost);
              }
            } else {
              await updateUserBalance(userId, txValue);
              sendMessageToUser(userId, 'NOTIFY', { message: `Successful top up: ${txValue.toFixed(9)} TON` });
            }
          } else {
            console.log('unknown user Id');
          }

        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message)
        } else {
          console.log('An unknown error occurred')
        }
      }
    }
  } while (response.length == blockSize);

  if (firstProcessedTxLt) {
    lastCheckedLt = firstProcessedTxLt;
  }

}


// Function to process incoming transactions
async function processIncomingTransactions() {
  try {
    await fetchAndProcessTransactions(lastCheckedLt);
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
}


// Schedule the processIncomingTransactions function to run every 5 seconds
setInterval(processIncomingTransactions, 10000);