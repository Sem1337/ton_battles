import { Request, Response } from 'express'
import { GameRoomService } from '../services/GameRoomService.js'
import { getSocketInstance } from '../utils/socket.js'

export class GameRoomController {
  static async createGameRoom(req: Request, res: Response) {
    const { minBet, maxBet, maxPlayers } = req.body
    const user = (req as any).user
    const userId = user?.userId // Extract user ID from the verified token
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
    }
    try {
      const gameRoom = await GameRoomService.createGameRoom(minBet, maxBet, maxPlayers, userId)
      res.status(201).json(gameRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async joinGameRoom(req: Request, res: Response) {
    const { roomId } = req.params
    try {
      const user = (req as any).user
      const userId = user?.userId // Extract user ID from the verified token
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const gameRoom = await GameRoomService.joinGameRoom(roomId, userId)
      const io = getSocketInstance();
      io.to(roomId).emit('PLAYER_JOINED', { userId, roomId }); // Notify other players
      res.status(200).json(gameRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async getGameRooms(_req: Request, res: Response) {
    try {
      const gameRooms = await GameRoomService.getGameRooms()
      res.status(200).json(gameRooms)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async getGameRoom(req: Request, res: Response) {
    const { roomId } = req.params
    try {
      const gameRoom = await GameRoomService.getGameRoom(roomId)
      res.status(200).json(gameRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async makeBet(req: Request, res: Response) {
    const { roomId } = req.params
    const { betSize } = req.body
    try {
      const user = (req as any).user
      const userId = user?.userId // Extract user ID from the verified token
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const updatedRoom = await GameRoomService.makeBet(roomId, userId, betSize)
      const io = getSocketInstance();
      io.to(roomId).emit('BET_MADE', { userId, roomId, betSize }); // Notify other players
      res.status(200).json(updatedRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async leaveGameRoom(req: Request, res: Response) {
    const { roomId } = req.params;
    const userId = (req as any).user.userId; // Assuming userId is available in the request
    try {
      const gameRoom = await GameRoomService.leaveGameRoom(roomId, userId);
      res.status(200).json(gameRoom);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }

}
