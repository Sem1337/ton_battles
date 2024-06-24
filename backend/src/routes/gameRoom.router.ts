import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import GameRoom from '../database/model/gameRoom.js';

const router = express.Router();
const jsonParser = bodyParser.json();

// Route to get all game rooms
router.get('/game-rooms', async (_req: Request, res: Response) => {
  try {
    const gameRooms = await GameRoom.findAll();
    res.json(gameRooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game rooms' });
  }
});

// Route to create a new game room
router.post('/game-rooms', jsonParser, async (req: Request, res: Response) => {
  const { total_bank, winner, time_of_start, status } = req.body;

  try {
    const newGameRoom = await GameRoom.create({
      total_bank,
      winner,
      time_of_start,
      status,
    });
    return res.status(201).json(newGameRoom);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create game room' });
  }
});

// Route to get a game room by ID
router.get('/game-rooms/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    const gameRoom = await GameRoom.findByPk(id);
    if (!gameRoom) {
      return res.status(404).json({ error: 'Game room not found' });
    }

    return res.json(gameRoom);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch game room' });
  }
});

// Route to update a game room status by ID
router.put('/game-rooms/:id/status', jsonParser, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  try {
    const gameRoom = await GameRoom.findByPk(id);
    if (!gameRoom) {
      return res.status(404).json({ error: 'Game room not found' });
    }

    gameRoom.status = status;
    await gameRoom.save();

    return res.json(gameRoom);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update game room status' });
  }
});

export default router;
