// LeaderboardModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { authFetch } from '../../utils/auth'; // Adjust the import path if necessary
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/types';

Modal.setAppElement('#root');

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/leaderboard`, token);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch leaderboard');
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <div className="overflow-y-scroll max-h-96">
          <ul>
            {users.map((user, index) => (
              <li key={user.userId} className="border-b py-2 flex justify-between">
                <span className="font-bold">{index + 1}. {user.username}</span>
                <span>{user.points} points</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default LeaderboardModal;
