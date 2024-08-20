import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { User } from '../../types/types';
import './BalanceInfo.css';

const BalanceInfo = () => {
  const [gems, setGems] = useState<number>(0);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null)
  const { sendMessage, on, off } = useSocket();

  useEffect(() => {
    console.log('balance info use effect')

    const handleBalanceUpdate = (data: User) => {
      setBalance(Number(data.balance).toFixed(9));
      setGems(data.gems);
      setLoading(false);
    };

    const handleConnected = () => {
      sendMessage('GET_BALANCE');
    };

    on('USER_INFO', handleBalanceUpdate);
    on('CONNECTED', handleConnected);

    return () => {
      off('USER_INFO', handleBalanceUpdate);
      off('CONNECTED');
    };
  }, [sendMessage, on, off]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="balance-info">
      <h3 className="balance-title">Your Gems</h3>
      <p className="balance-amount">{gems !== null ? `${gems} gems` : 'Balance not available'}</p>
      <h3 className="balance-title">Your Balance</h3>
      <p className="balance-amount">{balance} TON</p>
    </div>
  );
};

export default BalanceInfo;
