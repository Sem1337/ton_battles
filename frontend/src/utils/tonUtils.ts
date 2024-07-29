import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';
import toast from 'react-hot-toast';

export const useTonTransaction = () => {
  const [tonConnectUI] = useTonConnectUI();

  const sendTonTransaction = async (amount: string, payload: string) => {
    const currentIsConnectedStatus = tonConnectUI.connected;
    if (currentIsConnectedStatus) {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: 'UQCn0VvM7Rx7t3IJ38RBUnCFEpqUfOval4SJ2mV8HQOV79O3', // Replace with the actual address
            amount: toNano(amount).toString(), // Convert to nano format
            payload: beginCell().storeUint(0,32).storeStringTail(payload).endCell().toBoc().toString('base64'), // Convert payload to base64
          },
        ],
      };

      try {
        await tonConnectUI.sendTransaction(transaction);
        toast.loading('Processing transaction');
        return true;
      } catch (error) {
        console.error('Transaction error:', error);
        toast.error('Failed sending transaction');
        return false;
      }
    } else {
      toast.error('Wallet is not connected!');
    }
  };

  return { sendTonTransaction };
};
