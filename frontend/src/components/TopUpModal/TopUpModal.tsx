import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;
import { useState } from 'react';

interface TopUpModalProps {
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

const TopUpModal = ({ onClose, onTopUp } : TopUpModalProps) => {
  const [amount, setAmount] = useState(0);

  const handleTopUp = async () => {
    try {
      onTopUp(amount);
    } catch (error) {
      console.error('Transaction error:', error);
    }
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Top Up Balance</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
        <button onClick={handleTopUp}>Top Up</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TopUpModal;
