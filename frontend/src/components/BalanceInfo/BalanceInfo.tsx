import React, { useState, useEffect } from 'react';
import TopUpModal from '../TopUpModal/TopUpModal';
import WithdrawModal from '../WithdrawModal/WithdrawModal';

export const BalanceInfo: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the initial balance from the backend or wallet
    const fetchBalance = async () => {
      // Replace with your actual API call
      const response = await fetch('/getBalance');
      const data = await response.json();
      setBalance(data.balance);
    };

    fetchBalance();
  }, []);

  const handleTopUp = async (amount: number) => {
    try {
      // Assuming the transaction is created and confirmed in the modal
      const response = await fetch('/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(balance + amount);
      }
    } catch (error) {
      console.error('Top-up error:', error);
    }
  };

  const handleWithdraw = async (amount: number) => {
    try {
      // Assuming the transaction is created and confirmed in the modal
      const response = await fetch('/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(balance - amount);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  return (
    <div>
      <h1>Balance: {balance}</h1>
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
