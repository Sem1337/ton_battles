import { Router } from 'express';
import { topUpBalance, withdrawBalance } from '../controllers/balanceController.js';

const router = Router();

router.post('/withdraw', withdrawBalance);
router.get('/topup', topUpBalance);

export default router;
