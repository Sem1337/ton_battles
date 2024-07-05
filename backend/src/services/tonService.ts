import TonWeb from 'tonweb';
import dotenv from 'dotenv';

dotenv.config();

const TonWebInstance = TonWeb.default || TonWeb;

const providerUrl = 'https://testnet.toncenter.com/api/v3/jsonRPC';
const apiKey = process.env.TON_API_KEY; // Replace with your TON center API key

const tonweb = new TonWebInstance(new TonWebInstance.HttpProvider(providerUrl, { apiKey }));

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

const publicKey = hexToUint8Array(publicKeyHex);
const secretKey = hexToUint8Array(secretKeyHex);

const wallet = tonweb.wallet.create({
  publicKey: publicKey,
});

export const createTransaction = async (amount: number, walletAddress: string) => {
  const seqno = await wallet.methods.seqno().call();
  if (seqno === undefined) {
    throw new Error('Failed to retrieve seqno');
  }

  const amountNano = tonweb.utils.toNano(amount.toString());

  const transfer = wallet.methods.transfer({
    secretKey: secretKey,
    toAddress: walletAddress,
    amount: amountNano,
    seqno,
    payload: '',
    sendMode: 3,
  });

  return transfer;
};

export const confirmTransaction = async (transfer: any) => {
  try {
    const transferFee = await transfer.estimateFee();   // get estimate fee of transfer

    const transferSended = await transfer.send();  // send transfer query to blockchain
    
    const transferQuery = await transfer.getQuery(); // get transfer query Cell
    console.log('transferFee', transferFee);
    console.log('transferSended', transferSended);
    console.log('transferQuery', transferQuery);
    //await transfer.send();
    console.log('transfer', transfer);
    return true;
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
};
