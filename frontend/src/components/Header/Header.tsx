import React, { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import BalanceInfo from '../BalanceInfo/BalanceInfo'; // Adjust the import path if necessary
import LeaderboardModal from '../Leaderboard/Leaderboard';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export const Header: React.FC = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const navigate = useNavigate();

  /*const handleTopUp = async (amount: string) => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/topup`, token);
      const data = await response.json();
      const txPayload = data.txPayload;
      if (txPayload) {
        const body = beginCell()
          .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
          .storeStringTail(txPayload) // write our text comment
          .endCell();
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
          messages: [
            {
              address: 'UQCn0VvM7Rx7t3IJ38RBUnCFEpqUfOval4SJ2mV8HQOV79O3', // replace with your main wallet address
              amount: toNano(amount).toString(),
              payload: body.toBoc().toString("base64")
            }
          ]
        };
        await tonConnectUI.sendTransaction(transaction);
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
      WebApp.openInvoice(data.invoiceURL);
      console.log('openned invoiceURL');
    } else {
      console.log('Failed to initiate payment.');
    }
  };*/

  return (
    <header className="header">
      <div className="header-container">
        <h2 className="header-title">
          <Link to="/" className="header-link">TON Battles</Link>
        </h2>
        <TonConnectButton />
        <BalanceInfo />
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
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      </div>
    </header>
  );
};

export default Header;
