import { useState } from 'react';
import Modal from 'react-modal';

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff', // Set background color
    color: '#000', // Set text color
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Set overlay background color
  },
};

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export const TopUpModal = ({ isOpen, onClose, onTopUp } : TopUpModalProps) => {
  const [amount, setAmount] = useState(0);


  const handleConfirm = () => {
    onTopUp(amount);
    setAmount(0); // Reset the amount
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Top Up"
    >
      <h2>Top Up</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount"
      />
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </Modal>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

