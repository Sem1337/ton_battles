// controllers/TaskController.ts
import { Request, Response } from 'express';
import TaskService from '../services/TaskService.js';

class TaskController {
  static async getTasks(req: Request, res: Response) {
    try {
      const user = (req as any).user
      const userId = user?.userId // Extract user ID from the verified token
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const tasks = await TaskService.getAllTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  static async completeTask(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user
    const userId = user?.userId // Extract user ID from the verified token
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
    }

    try {
      await TaskService.completeTask(id, userId, false);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  static async getTonTaskPayload(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user
    const userId = user?.userId // Extract user ID from the verified token
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
    }
    try {
      const txPayload = await TaskService.generateTonInvoicePayload(userId, id);
      res.json({success: true, txPayload: txPayload});
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
}

export default TaskController;
