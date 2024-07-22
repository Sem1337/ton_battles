// services/TaskService.ts
import Big from 'big.js';
import { Task } from '../database/model/Task.js';
import { User } from '../database/model/user.js';
import { updateUserPoints } from './balanceService.js';
import sequelize from '../database/db.js';

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

  static async completeTask(taskId: string, userId: number) {
    const transaction = await sequelize.transaction();

    try {
      const task = await Task.findByPk(taskId, { transaction });
      if (!task) {
        throw new Error('Task not found');
      }

      const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });

      if (!user) {
        throw new Error('User not found');
      }
      // Check if the user already completed the task to avoid duplicates
      const hasTask = await (user as any).hasCompletedTask(task, { transaction });
      if (hasTask) {
        throw new Error('Task already completed');
      }

      // Mark the task as completed by the user
      await (user as any).addCompletedTask(task, { transaction });
      await updateUserPoints(user.userId, new Big(task.reward), transaction);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
