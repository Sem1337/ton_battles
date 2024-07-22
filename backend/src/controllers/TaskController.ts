// controllers/TaskController.ts
import { Request, Response } from 'express';
import TaskService from '../services/TaskService.js';
import { User } from '../database/model/user.js';

class TaskController {
  static async getTasks(req: Request, res: Response) {
    try {
        const user: User = (req as any).user;
        const tasks = await TaskService.getAllTasks(user.userId);
        res.json(tasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
  }

  static async completeTask(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    try {
      await TaskService.completeTask(id, user);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
      res.status(500).json({ error: 'Failed to mark task as completed' });
    }
  }
}

export default TaskController;
