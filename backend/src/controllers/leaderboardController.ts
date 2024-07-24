import { Request, Response } from 'express';
import { User } from '../database/model/user.js';
import { col, fn } from 'sequelize';

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      limit: 50,
      order: [[fn('CAST', col('points'), 'DECIMAL(65, 0)'), 'DESC']],
      attributes: ['userId', 'username', 'points']
    });
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
