// TaskCardModal.tsx
import React from 'react';
import Modal from 'react-modal';
import { Task } from '../../types/types';
import './TasksList.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTonTransaction } from '../../utils/tonUtils';

Modal.setAppElement('#root');

interface TaskCardModalProps {
  task: Task;
  onClose: () => void;
}

const TaskCardModal: React.FC<TaskCardModalProps> = ({ task, onClose }) => {
  const { authFetch } = useAuth();
  const { sendTonTransaction } = useTonTransaction();

  const handleTaskCompletion = async () => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        console.log('Task marked as completed');
      } else {
        console.error('Failed to mark task as completed');
      }
      task.completed = true;
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const handleLinkClick = async () => {
    switch (task.actionType) {
      case 'url':
        window.open(task.payload, '_blank');
        if (!task.completed) {
          await handleTaskCompletion();
        }
        break;
      case 'transaction': {
        const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/tasks/${task.id}/getPayload`);
        const data = await response.json();
        if (data.success) {
          const success = await sendTonTransaction(task.payload, data.txPayload);
          if (success) {
            await handleTaskCompletion();
          }
        } else {
          console.log('Failed to proceed payment.', data.message);
        }
      }
        break;
      case 'refs':
        await handleTaskCompletion();
        break;
      case 'other':
        // Implement other action logic
        console.log('Other action');
        await handleTaskCompletion();
        break;
      default:
        console.error('Unknown action type');
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-body">
        <button onClick={onClose} className="modal-close-button">
          &times;
        </button>
        <h2 className="modal-title">{task.taskName}</h2>
        <p className="modal-description">{task.taskDescription}</p>
        <button
          onClick={handleLinkClick}
          className="modal-button"
        >
          Go to Task
        </button>
      </div>
    </Modal>
  );
};

export default TaskCardModal;
