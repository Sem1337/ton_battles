import React, { useState } from 'react';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onWithdraw }) => {
  const [amount, setAmount] = useState<number>(0);

  const handleWithdraw = async () => {
    try {
      const response = await fetch('/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (data.success) {
        onWithdraw(amount);
      } else {
        console.error('Withdraw error:', data.message);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Withdraw Balance</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
        <button onClick={handleWithdraw}>Withdraw</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default WithdrawModal;
