// services/TaskService.ts
import Big from 'big.js';
import { Task } from '../database/model/Task.js';
import { User } from '../database/model/user.js';
import { updateUserPoints } from './balanceService.js';
import sequelize from '../database/db.js';
import jwt from 'jsonwebtoken';
import { sendNotificationToUser } from './messageService.js';

class TaskService {

  static async generateTonInvoicePayload(userId: string, taskId: string) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    const txPayload = jwt.sign({ tag: 'TONBTL', userId: userId, cost: task.payload, taskId: taskId }, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' });
    return txPayload;
  }

  static async getAllTasks(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: Task, as: 'completedTasks' }]
    });
    const tasks = await Task.findAll();

    return tasks.map(task => ({
      ...task.get(),
      completed: user?.completedTasks?.some((completedTask: Task) => completedTask.id === task.id && task.actionType !== 'transaction') || false,
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

      const user = await User.findByPk(userId, {include: [{ model: User, as: 'referrals' }], transaction });

      if (!user) {
        throw new Error('User not found');
      }

      if (task.actionType !== 'transaction') {
        if (task.actionType === 'refs' && user.referrals.length < parseInt(task.payload)) {
          await sendNotificationToUser(userId.toString(), { message: `Task not completed` });
          await transaction.rollback();
          return;
        }
        // Check if the user already completed the task to avoid duplicates
        const hasTask = await (user as any).hasCompletedTask(task, {transaction});
        if (hasTask) {
          throw new Error('Task already completed');
        }

        // Mark the task as completed by the user
        await (user as any).addCompletedTask(task, {transaction});
      }
      await updateUserPoints(user.userId, new Big(task.reward), transaction);
      await transaction.commit();
      await sendNotificationToUser(userId.toString(), { message: `Task completed! You received "${task.reward}" points` });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }


  static async seedTasks() {
    try {
      const tasksData = [
        {
          taskName: 'Telegram community',
          taskDescription: 'Join our telegram community to get this reward.',
          reward: '10000',
          payload: 'https://t.me/ton_battles_community',
          actionType: 'url'
        },
        {
          taskName: 'TON Transaction',
          taskDescription: 'Confirm transaction in TON blockchain.',
          reward: '120000',
          payload: '0.08',
          actionType: 'transaction'
        },
        {
          taskName: 'invite 5 friends',
          taskDescription: 'Invite 5 friend.',
          reward: '200000',
          payload: '5',
          actionType: 'refs'
        },

        {
          taskName: 'invite 50 friends',
          taskDescription: 'Invite 50 friend.',
          reward: '3000000',
          payload: '50',
          actionType: 'refs'
        },

        {
          taskName: 'invite 200 friends',
          taskDescription: 'Invite 200 friend.',
          reward: '15000000',
          payload: '200',
          actionType: 'refs'
        },
        // Add more tasks as needed
      ];
      tasksData.forEach(async (taskData) => {
        const task = await Task.findOne({where : taskData});
        if (task) {
          await task.update(taskData);
        } else {
          await Task.create(taskData);
        }
      });

      console.log('Tasks have been added.');
    } catch (error) {
      console.error('Unable to seed tasks:', error);
    }
  }
}


export default TaskService;
