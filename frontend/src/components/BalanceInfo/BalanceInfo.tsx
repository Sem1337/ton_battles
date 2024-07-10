import { useState, useEffect } from 'react';
import { TopUpModal } from '../TopUpModal/TopUpModal';
import { WithdrawModal } from '../WithdrawModal/WithdrawModal';
import { useAuth } from '../AuthContext';
import { authFetch } from '../../utils/auth';
import { webSocketClient } from '../../utils/WebSocketClient';

export const BalanceInfo = () => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null)
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalance = async () => {
      // Set up WebSocket event listener for balance updates
      const handleBalanceUpdate = (newBalance: number) => {
        setBalance(newBalance);
      };
      webSocketClient.on('balanceUpdate', handleBalanceUpdate);
      try {
        console.log('fetching balance');
        webSocketClient.getBalance();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBalance();
    }
    // Cleanup listener on component unmount
    return () => {
      webSocketClient.off('balanceUpdate');
    };
  }, [isAuthenticated]);

  const handleTopUp = async (amount: number) => {
    try {
      // Assuming the transaction is created and confirmed in the modal
      alert(`Your balance will be updated after transaction processed. (top up ${amount} TON)`);
    } catch (error) {
      console.error('Top-up error:', error);
    }
  };

  const handleWithdraw = async (amount: number, walletAddress: string) => {
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
      if (data.success) {
        setBalance(balance - amount);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Your Balance</h1>
      <p>{balance !== null ? `${balance} TON` : 'Balance not available'}</p>
      <button onClick={() => setShowTopUpModal(true)}>Top Up</button>
      <button onClick={() => setShowWithdrawModal(true)}>Withdraw</button>

      {showTopUpModal && (
        <TopUpModal
          onClose={() => setShowTopUpModal(false)}
          onTopUp={handleTopUp}
        />
      )}
      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
};

export default BalanceInfo;
