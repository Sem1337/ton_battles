// LeaderboardModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { authFetch } from '../../utils/auth'; // Adjust the import path if necessary
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/types';
import './Leaderboard.css';

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
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-body">
        <h2 className="modal-title">Leaderboard</h2>
        <button onClick={onClose} className="modal-close-button">
          &times;
        </button>
        <div className="modal-scroll">
          <ul className="leaderboard-list">
            {users.map((user, index) => (
              <li key={user.userId} className="leaderboard-item">
                <span className="leaderboard-rank">{index + 1}. {user.username}</span>
                <span className="leaderboard-points">{user.points} points</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default LeaderboardModal;
