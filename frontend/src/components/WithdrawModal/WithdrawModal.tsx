import { useTonAddress } from '@tonconnect/ui-react';
import { useState } from 'react';
import Modal from 'react-modal';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: string, walletAddress: string) => void;
}

export const WithdrawModal = ({ isOpen, onClose, onWithdraw }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('');
  const walletAddress = useTonAddress();

  const handleConfirm = () => {
    onWithdraw(amount, walletAddress);
    setAmount('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Withdraw"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="overlay-custom-style"
    >
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-md mx-2">
        <h2 className="text-2xl font-bold mb-4">Withdraw</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full mb-4"
          placeholder="Enter amount"
        />
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues
