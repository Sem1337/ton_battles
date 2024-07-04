import { Router } from 'express';
import { topUpBalance, withdrawBalance, getBalance } from '../controllers/balanceController.js';

const router = Router();

router.post('/topup', topUpBalance);
router.post('/withdraw', withdrawBalance);
router.post('/getBalance', getBalance);

export default router;
