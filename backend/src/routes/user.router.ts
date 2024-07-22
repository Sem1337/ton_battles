import { Request, Response, Router } from 'express';
import bodyParser from 'body-parser';
import { User } from '../database/model/user.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';

const router = Router();
const jsonParser = bodyParser.json();

// Route to get all users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Failed to fetch users', details: 'Unknown error occurred' });
    }
  }
});

// Route to add a user by ID
router.post('/users/:id', jsonParser, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { balance } = req.body;

  try {
    const existingUser = await User.findByPk(id);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this ID already exists' });
    }

    const newUser = await User.create({ id, balance });
    return res.status(201).json(newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      return res.status(500).json({ error: 'Failed to create user', details: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Failed to create user', details: 'Unknown error occurred' });
    }
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching user by ID:", error.message);
      return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Failed to fetch user', details: 'Unknown error occurred' });
    }
  }
});

router.get('/leaderboard', getLeaderboard);

export default router;
