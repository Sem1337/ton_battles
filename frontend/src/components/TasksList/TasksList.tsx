// TasksList.tsx
import React, { useState, useEffect } from 'react';
import TaskCardModal from './TaskCardModal';
import { Task } from '../../types/types'
import './TasksList.css';
import { useAuthFetch } from '../../utils/auth';


const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { authFetch } = useAuthFetch();

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, []);

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <div className="tasks-list">
      <h2 className="tasks-title">Tasks</h2>
      <div className="tasks-grid">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`task-card ${task.completed ? 'task-completed' : ''}`}
            onClick={() => handleCardClick(task)}
          >
            <h3 className="task-card-title">{task.taskName}</h3>
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
