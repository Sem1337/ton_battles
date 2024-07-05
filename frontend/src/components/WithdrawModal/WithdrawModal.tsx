import { useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number, walletAddress: string) => void;
}

export const WithdrawModal = ({ onClose, onWithdraw } : WithdrawModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const wallet = useTonWallet();
  
  const handleWithdraw = async () => {
    try {
      onWithdraw(amount, wallet?.account.address || 'undefined');
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
