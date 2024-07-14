import { useTonAddress } from '@tonconnect/ui-react';
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
  },
};

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, walletAddress: string) => void;
}

export const WithdrawModal = ({ isOpen, onClose, onWithdraw } : WithdrawModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const walletAddress = useTonAddress();

  const handleConfirm = () => {
    onWithdraw(amount, walletAddress);
    setAmount(0); // Reset the amount
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Withdraw"
    >
      <h2>Withdraw</h2>
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
