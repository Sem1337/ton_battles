import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import GameRoom from '../database/model/gameRoom.js';

const router = express.Router();
const jsonParser = bodyParser.json();

// Route to get all game rooms
router.get('/gameRooms', async (_req: Request, res: Response) => {
  try {
    const gameRooms = await GameRoom.findAll();
    return res.json(gameRooms);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching game rooms:", error.message);
      return res.status(500).json({ error: 'Failed to fetch game rooms', details: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Failed to fetch game rooms', details: 'Unknown error occurred' });
    }
  }
});

// Route to update game room status by ID
router.put('/gameRooms/:id/status', jsonParser, async (req: Request, res: Response) => {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating game room status:", error.message);
      return res.status(500).json({ error: 'Failed to update game room status', details: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Failed to update game room status', details: 'Unknown error occurred' });
    }
  }
});

export default router;
