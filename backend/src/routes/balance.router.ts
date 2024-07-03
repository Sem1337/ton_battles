import { Router } from 'express';
import { topUpBalance, withdrawBalance } from '../controllers/balanceController.js';

const router = Router();

router.post('/topup', topUpBalance);
router.post('/withdraw', withdrawBalance);

export default router;
