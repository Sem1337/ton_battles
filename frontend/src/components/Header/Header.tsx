import React, { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import BalanceInfo from '../BalanceInfo/BalanceInfo'; // Adjust the import path if necessary
import LeaderboardModal from '../Leaderboard/Leaderboard';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
//import { useAuth } from '../../contexts/AuthContext';
//import { useTonTransaction } from '../../utils/tonUtils';
//import { WithdrawModal } from '../WithdrawModal/WithdrawModal';
//import { TopUpModal } from '../TopUpModal/TopUpModal';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const navigate = useNavigate();
  //const { authFetch } = useAuth();
  //const { sendTonTransaction } = useTonTransaction();
  //const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  //const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  /*const handleTopUp = async (amount: string) => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/topup`);
      const data = await response.json();
      const txPayload = data.txPayload;
      if (txPayload) {
        await sendTonTransaction(amount, txPayload);
      }
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
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/withdraw`, {
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
  };*/

  /*const handleBuyPoints = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/buy_points`, token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      WebApp.openInvoice(data.invoiceURL);
      console.log('openned invoiceURL');
    } else {
      console.log('Failed to initiate payment.');
    }
  };*/

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h2 className="header-title">
            <Link to="/" className="header-link">TON Battles</Link>
          </h2>
          <BalanceInfo />
          <div className="balance-actions">
            <button className="withdraw-button" onClick={() => {
              toast('Soon!', {
                icon: '🚀',
              });
              //setIsWithdrawModalOpen(true)
            }}>
              Withdraw
            </button>
            {/*<button className="top-up-button" onClick={() => {
              toast('Soon!', {
                icon: '🚀',
              });
              //setIsTopUpModalOpen(true)
            }}>
              Top-Up
            </button>*/}
          </div>
        </div>
        <div className="header-right">
          <TonConnectButton />
          <div className="header-buttons">
            <button
              className="header-button"
              onClick={() => setIsLeaderboardOpen(true)}>
              Leaderboard
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="header-button"
            >
              Tasks
            </button>
          </div>
        </div>
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      </div>
    </header>
  );
  /*
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            onWithdraw={handleWithdraw}
          />
          <TopUpModal
            isOpen={isTopUpModalOpen}
            onClose={() => setIsTopUpModalOpen(false)}
            onTopUp={handleTopUp}
          />
  */
};

export default Header;
