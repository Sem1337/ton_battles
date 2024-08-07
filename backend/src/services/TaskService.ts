// services/TaskService.ts
import Big from 'big.js';
import { Task } from '../database/model/Task.js';
import { User } from '../database/model/user.js';
import { updateUserPoints } from './balanceService.js';
import sequelize from '../database/db.js';
import jwt from 'jsonwebtoken';

class TaskService {

  static async generateTonInvoicePayload(userId: string, taskId: string ) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    const txPayload = jwt.sign({tag: 'TONBTL', userId: userId, cost: task.payload, taskId: taskId }, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' });
    return txPayload;
  }

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

  static async completeTask(taskId: string, userId: number, fromTonService: boolean) {
    const transaction = await sequelize.transaction();

    try {
      const task = await Task.findByPk(taskId, { transaction });
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.actionType === 'transaction' && !fromTonService) {
        await transaction.commit();
        return;
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
          payload: 'https://t.me/crypto_airdrops2024_1',
          actionType: 'url'
        },
        {
          taskName: 'TON Transaction',
          taskDescription: 'Confirm transaction in TON blockchain.',
          reward: '20000',
          payload: '0.1',
          actionType: 'transaction'
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
