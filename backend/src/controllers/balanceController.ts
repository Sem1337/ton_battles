import { Request, Response } from 'express';
import { updateUserBalance } from '../services/balanceService.js';
import { createTransaction, confirmTransaction } from '../services/tonService.js';

export const topUpBalance = async (req: Request, res: Response) => {
  const { amount, id } = req.body;
  try {
    await updateUserBalance(id, amount);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

export const withdrawBalance = async (req: Request, res: Response) => {
  const { amount, id, walletAddress } = req.body;
  try {
    const transaction = await createTransaction(amount, walletAddress);
    const confirmed = await confirmTransaction(transaction);
    if (confirmed) {
      await updateUserBalance(id, -amount);
      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ success: false, message: 'Transaction failed' });
    }
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};
