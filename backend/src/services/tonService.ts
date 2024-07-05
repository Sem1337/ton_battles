import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import TonWeb from "tonweb"
import dotenv from 'dotenv';

dotenv.config();


//const providerUrl = 'https://toncenter.com/api/v2/jsonRPC';
//const apiKey = process.env.TON_API_KEY; // Replace with your TON center API key


const hexToUint8Array = (hex: string): Uint8Array => {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.slice(c, 2), 16));
  }
  return new Uint8Array(bytes);
};

// Replace these with your actual keys
const publicKeyHex = process.env.TON_PUBLIC_KEY_HEX || '';
const secretKeyHex = process.env.TON_PRIVATE_KEY_HEX || '';

const publicKey = Buffer.from(hexToUint8Array(publicKeyHex));
const secretKey = Buffer.from(hexToUint8Array(secretKeyHex));

const wallet = WalletContractV4.create({ publicKey: publicKey, workchain: 0 });
const endpoint = await getHttpEndpoint({ network: "mainnet" });
const client = new TonClient({ endpoint });
const walletContract = client.open(wallet);

export const createTransaction = async (amount: number, walletAddress: string) => {
  const seqno = await walletContract.getSeqno();
  console.log('seqno:', seqno);
  console.log('my wallet addr:', wallet.address.toString());
  console.log('current balance:', client.getBalance(wallet.address));
  if (seqno === undefined) {
    throw new Error('Failed to retrieve seqno');
  }
  if (!TonWeb.default.utils.Address.isValid(walletAddress)) {
    throw new Error('receiver wallet address is incorrect!');
  }

  const transfer = walletContract.createTransfer({
    secretKey: secretKey,
    seqno,
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

export const confirmTransaction = async (transfer: any) => {
  try {

    walletContract.sendTransfer(transfer);
    //await transfer.send();
    console.log('transfer', transfer);
    return true;
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
};
