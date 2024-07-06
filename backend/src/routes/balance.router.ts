import { Router } from 'express';
import { withdrawBalance, getBalance } from '../controllers/balanceController.js';

const router = Router();

router.post('/withdraw', withdrawBalance);
router.get('/getBalance', getBalance);

export default router;
