import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import User from '../database/model/user.js';

const router = express.Router();
const jsonParser = bodyParser.json();

// Route to get all users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Route to add a user by ID
router.post('/users/:id', jsonParser, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { balance } = req.body;

  try {
    // Check if user with the same ID already exists
    const existingUser = await User.findByPk(id);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this ID already exists' });
    }

    // Create new user
    const newUser = await User.create({ id, balance });
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Route to get a user by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
