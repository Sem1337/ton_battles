import { Request, Response } from 'express';
import { updateUserBalance, getUserBalance} from '../services/balanceService.js';
import { createTransaction, confirmTransaction } from '../services/tonService.js';

export const withdrawBalance = async (req: Request, res: Response) => {
  const { amount, walletAddress } = req.body;
  const user = (req as any).user;
  const userId = user?.userId; // Extract user ID from the verified token
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  if (amount < 0.5) {
    return res.status(400).json({error: 'Minimal withdraw amount is 0.5 TON'});
  }
  if (getUserBalance(userId) < amount) {
    return res.status(400).json({error: 'Insufficient balance'});
  }
  try {
    const transaction = await createTransaction(amount, walletAddress);
    const confirmed = await confirmTransaction(transaction);
    if (confirmed) {
      await updateUserBalance(userId, -amount);
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false, message: 'Transaction failed' });
    }
  } catch (error) {
    return res.status(500).send({ success: false, error });
  }
};


export const getBalance = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.userId; // Extract user ID from the verified token
    console.log('getBalance: ', user);
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const balance = await getUserBalance(userId);
    return res.status(200).json({ balance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
