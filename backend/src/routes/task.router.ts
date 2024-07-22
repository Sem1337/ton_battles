// routes/taskRoutes.ts
import express from 'express';
import TaskController from '../controllers/TaskController.js';

const router = express.Router();

router.get('/tasks', TaskController.getTasks);
router.post('/tasks/:id/complete', TaskController.completeTask);

export default router;
