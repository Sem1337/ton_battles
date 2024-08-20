import { Request, Response } from 'express';
import { updateUserBalance, getUserBalance, generateTonTopUpPayload } from '../services/balanceService.js';
import { createTransaction, confirmTransaction } from '../services/tonService.js';
import Big from 'big.js'; // Import Big.js

export const withdrawBalance = async (req: Request, res: Response) => {
  const { amount, walletAddress } = req.body;
  const user = (req as any).user;
  const userId = user?.userId; // Extract user ID from the verified token
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const numericAmount = new Big(amount);
    if (numericAmount.lt(0.5)) {
      return res.status(400).json({ error: 'Minimal withdraw amount is 0.5 TON' });
    }
    if (numericAmount.gt(1000)) {
      return res.status(400).json({ error: 'Max one-time withdraw amount is 1000 TON' });
    }
    const userBalance = await getUserBalance(userId);
    if (numericAmount.gt(userBalance)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    try {
      await updateUserBalance(userId, numericAmount.neg());
    } catch (error) {
      return res.status(500).send({ success: false, error });
    }
    try {
      const transaction = await createTransaction(amount, walletAddress);
      await confirmTransaction(transaction);
      return res.status(200).send({ success: true });
    } catch (error) {
      await updateUserBalance(userId, numericAmount);
      return res.status(500).send({ success: false, error });
    }
  } catch (error) {
    return res.status(500).send({ success: false, error });
  }
};

export const topUpBalance = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user?.userId; // Extract user ID from the verified token
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const txPayload = generateTonTopUpPayload(userId);
  return res.status(200).json({ txPayload });
};
