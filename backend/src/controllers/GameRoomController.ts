import { Request, Response } from 'express'
import { GameRoomService } from '../services/GameRoomService.js'

export class GameRoomController {
  static async createGameRoom(req: Request, res: Response) {
    const {gameType, minBet, maxBet, maxPlayers, roomName } = req.body
    console.log(req.body);
    console.log(minBet, maxBet, maxPlayers);
    const user = (req as any).user
    const userId = user?.userId // Extract user ID from the verified token
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
    }
    try {
      const gameRoom = await GameRoomService.createGameRoom(gameType, minBet, maxBet, maxPlayers, roomName)
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
      if (!gameRoom) {
        throw new Error('error joining room');
      }
      res.status(200).json(gameRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }

  static async getGameRooms(req: Request, res: Response) {
    const { page = 1, limit = 10, sort = 'roomName', filter = '', gameType = 'points' } = req.query;
    console.log('fetching games: ', gameType, sort, filter);
    try {
      const gameRooms = await GameRoomService.getGameRooms({ page, limit, sort, filter, gameType })
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
      res.status(200).json(updatedRoom)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
  }
}
