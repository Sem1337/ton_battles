// TasksList.tsx
import React, { useState, useEffect } from 'react';
import TaskCardModal from '../TaskCardModal/TaskCardModal';
import { authFetch } from '../../utils/auth'; // Adjust the import path if necessary
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types/types'


const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/tasks`, token);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, [token]);

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-100 ${task.completed ? 'opacity-50' : ''}`}
            onClick={() => handleCardClick(task)}
          >
            <h3 className="text-xl font-semibold">{task.taskName}</h3>
            <p>Reward: {task.reward}</p>
          </div>
        ))}
      </div>
      {selectedTask && (
        <TaskCardModal
          task={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TasksList;
