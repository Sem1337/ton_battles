import { Router } from 'express';
import { withdrawBalance } from '../controllers/balanceController.js';

const router = Router();

router.post('/withdraw', withdrawBalance);

export default router;
