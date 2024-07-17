import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import BalanceInfo from '../BalanceInfo/BalanceInfo'; // Adjust the import path if necessary
import { authFetch } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import { beginCell, toNano } from '@ton/core';
import { WithdrawModal } from '../WithdrawModal/WithdrawModal';
import { TopUpModal } from '../TopUpModal/TopUpModal';
import { Link } from 'react-router-dom';


export const Header: React.FC = () => {
  const { token } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { tgUserId } = useAuth();

  const handleTopUp = async (amount: string) => {
    try {
      console.log('TONBTL_' + tgUserId.toString());
      const body = beginCell()
        .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
        .storeStringTail('TONBTL_' + tgUserId.toString()) // write our text comment
        .endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: 'UQCuzcR3-BXHkYHk7mN5ghbsUAX74mj-6BLn0wzvvXKHLXKx', // replace with your main wallet address
            amount: toNano(amount).toString(),
            payload: body.toBoc().toString("base64")
          }
        ]
      };
      await tonConnectUI.sendTransaction(transaction);
    } catch (error) {
      console.error('Transaction error:', error);
    }
    setIsTopUpModalOpen(false);
  };

  const handleWithdraw = async (amount: string, walletAddress: string) => {
    try {
      console.log('amount: ', amount);
      console.log('address: ', walletAddress);
      // Assuming the transaction is created and confirmed in the modal
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/withdraw`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, walletAddress }),
        credentials: 'include', // Include cookies in the request
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
    setIsWithdrawModalOpen(false);
  };

  const handleBuyPoints = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/buy_points`, token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      const invoiceResponse = await fetch(data.invoiceURL)
      console.log(invoiceResponse.body);
    } else {
      console.log('Failed to initiate payment.');
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">
          <Link to="/">TON Battles</Link>
        </h1>
        <TonConnectButton />
        <div className="flex space-x-2">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsTopUpModalOpen(true)}>
            Top Up
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsWithdrawModalOpen(true)}>
            Withdraw
          </button>
        </div>
        <BalanceInfo />
        <button onClick={handleBuyPoints} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Buy Points
        </button>
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          onTopUp={handleTopUp}
        />

        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdraw={handleWithdraw}
        />
      </div>
    </header>
  );
};

export default Header;
