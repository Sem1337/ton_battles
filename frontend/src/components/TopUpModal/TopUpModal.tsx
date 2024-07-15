import { useState } from 'react';
import Modal from 'react-modal';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: string) => void;
}

export const TopUpModal = ({ isOpen, onClose, onTopUp } : TopUpModalProps) => {
  const [amount, setAmount] = useState('');


  const handleConfirm = () => {
    onTopUp(amount);
    setAmount(''); // Reset the amount
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Top Up"
      className="modal-custom-style"
      overlayClassName="overlay-custom-style"
    >
      <h2 className="text-2xl font-bold mb-4">Top Up</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-4"
        placeholder="Enter amount"
      />
      <button
        onClick={handleConfirm}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        Confirm
      </button>
      <button
        onClick={onClose}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Cancel
      </button>
    </Modal>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

