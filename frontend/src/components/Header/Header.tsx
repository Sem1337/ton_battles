import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import BalanceInfo from '../BalanceInfo/BalanceInfo'; // Adjust the import path if necessary
import { authFetch } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import { beginCell } from '@ton/core';
import { WithdrawModal } from '../WithdrawModal/WithdrawModal';
import { TopUpModal } from '../TopUpModal/TopUpModal';
import { Link } from 'react-router-dom';


export const Header: React.FC = () => {
  const { token } = useAuth();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { tgUserId } = useAuth();

  const handleTopUp = async (amount: number) => {
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
            amount: (amount * 1000000000).toString(),
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

  const handleWithdraw = async (amount: number, walletAddress: string) => {
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

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">TON Battles</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <TonConnectButton />
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
          <BalanceInfo />
        </div>
      </div>

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
    </header>
  );
};

export default Header;
