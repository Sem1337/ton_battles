// services/TaskService.ts
import Big from 'big.js';
import { Task } from '../database/model/Task.js';
import { User } from '../database/model/user.js';
import { updateUserPoints } from './balanceService.js';

class TaskService {
  static async getAllTasks(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: Task, as: 'completedTasks' }]
    });
    const tasks = await Task.findAll();

    return tasks.map(task => ({
      ...task.get(),
      completed: user?.completedTasks?.some((completedTask: Task) => completedTask.id === task.id) || false,
    }));
  }

  static async completeTask(taskId: string, user: User) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if the user already completed the task to avoid duplicates
    const hasTask = await user.hasTask(task.id);
    if (hasTask) {
      throw new Error('Task already completed');
    }

    // Mark the task as completed by the user
    await user.addTask(task);
    await user.save();
    await updateUserPoints(user.userId, new Big(task.reward));
  }


  static async seedTasks() {
    try {
      const taskCount = await Task.count();

      if (taskCount > 0) {
        console.log('Tasks already exist. Skipping seeding.');
        return;
      }

      await Task.bulkCreate([
        {
          taskName: 'Telegram community',
          taskDescription: 'Join our telegram community to get this reward.',
          reward: '10000',
          url: 'https://t.me/crypto_airdrops2024_1',
        },
        // Add more tasks as needed
      ]);

      console.log('Tasks have been added.');
    } catch (error) {
      console.error('Unable to seed tasks:', error);
    }
  }
}


export default TaskService;
