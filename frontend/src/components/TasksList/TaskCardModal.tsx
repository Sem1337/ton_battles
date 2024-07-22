// TaskCardModal.tsx
import React from 'react';
import Modal from 'react-modal';
import { authFetch } from '../../utils/auth'; // Adjust the import path if necessary
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types/types';

Modal.setAppElement('#root');

interface TaskCardModalProps {
  task: Task;
  onClose: () => void;
}

const TaskCardModal: React.FC<TaskCardModalProps> = ({ task, onClose }) => {
  const { token } = useAuth();

  const handleTaskCompletion = async () => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/tasks/${task.id}/complete`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        console.log('Task marked as completed');
      } else {
        console.error('Failed to mark task as completed');
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const handleLinkClick = () => {
    window.open(task.url, '_blank');
    handleTaskCompletion();
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <h2 className="text-2xl font-bold mb-4">{task.taskName}</h2>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <p className="mb-4">{task.taskDescription}</p>
        <button
          onClick={handleLinkClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Task
        </button>
      </div>
    </Modal>
  );
};

export default TaskCardModal;
