import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { User } from '../../types/types';

const BalanceInfo = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null)
  const { sendMessage, on, off } = useSocket();

  useEffect(() => {
    console.log('balance info use effect')

    const handleBalanceUpdate = (data: User) => {
      setBalance(parseFloat(data.balance));
      setLoading(false);
    };

    const handleConnected = () => {
      sendMessage('GET_BALANCE');
    };

    on('USER_INFO', handleBalanceUpdate);
    on('CONNECTED', handleConnected);

    return () => {
      off('USER_INFO');
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
    <div>
      <h2 className="text-xl font-bold">Your Balance</h2>
      <p>{balance !== null ? `${balance} TON` : 'Balance not available'}</p>
    </div>
  );
};

export default BalanceInfo;
