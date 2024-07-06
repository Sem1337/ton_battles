import { Cell, TonClient, WalletContractV4, fromNano, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import dotenv from 'dotenv';

dotenv.config();


//const providerUrl = 'https://toncenter.com/api/v2/jsonRPC';
//const apiKey = process.env.TON_API_KEY; // Replace with your TON center API key

// Replace these with your actual keys
const publicKeyHex = process.env.TON_PUBLIC_KEY_HEX || '';
const secretKeyHex = process.env.TON_PRIVATE_KEY_HEX || '';

const publicKey = Buffer.from(publicKeyHex, "hex");
const secretKey = Buffer.from(secretKeyHex, "hex");

const wallet = WalletContractV4.create({ publicKey: publicKey, workchain: 0 });
const endpoint = await getHttpEndpoint({ network: "mainnet" });
const client = new TonClient({ endpoint, apiKey: process.env.TON_API_KEY});
const walletContract = client.open(wallet);

export const createTransaction = async (amount: number, walletAddress: string) => {
  const seqno = await walletContract.getSeqno();
  console.log('seqno:', seqno);
  console.log('my wallet addr:', wallet.address.toString());
  const balance = await client.getBalance(wallet.address);
  console.log('current balance:', fromNano(balance));
  console.log('amount to withdraw', amount);
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
        value: amount.toString(),
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
