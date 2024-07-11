import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell } from "@ton/ton";
import { useAuth } from '../../contexts/AuthContext';

interface TopUpModalProps {
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export const TopUpModal = ({ onClose, onTopUp } : TopUpModalProps) => {
  const [amount, setAmount] = useState(0);
  const [tonConnectUI] = useTonConnectUI();
  const { tgUserId } = useAuth();

  const handleTopUp = async () => {
    try {
      console.log('TONBTL_' + tgUserId.toString());
      const body = beginCell()
                    .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
                    .storeStringTail('TONBTL_' + tgUserId.toString()) // write our text comment
                    .endCell();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: 'UQCuzcR3-BXHkYHk7mN5ghbsUAX74mj-6BLn0wzvvXKHLXKx', // replace with your main wallet address
            amount: (amount * 1000000000).toString(),
            payload: body.toBoc().toString("base64")
          }
        ]
      };
      await tonConnectUI.sendTransaction(transaction);
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

