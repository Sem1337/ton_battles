import { GameRoom, Player, Game } from '../database/model/gameRoom.js'

export class GameRoomService {
    static async createGameRoom(minBet: number, maxBet: number, maxPlayers: number) {
      try {
        const gameRoom = await GameRoom.create({
          minBet,
          maxBet,
          maxPlayers,
          total_bank: 0,
          status: 'active',
        })
        return gameRoom
      } catch (error) {
        throw new Error('Failed to create game room')
      }
    }
  
    static async joinGameRoom(roomId: string, userId: string) {
      try {
        const gameRoom = await GameRoom.findByPk(roomId, {
          include: [{ model: Player, as: 'players' }]
        })
        if (!gameRoom) {
          throw new Error('Game room not found')
        }
        if (gameRoom.players.length >= gameRoom.maxPlayers) {
          throw new Error('Game room is full')
        }
        await Player.create({
          id: userId,
          bet: 0,
          name: `Player${userId}`,
          gameRoomId: roomId,
        })
        return gameRoom
      } catch (error) {
        throw new Error('Failed to join game room')
      }
    }
  
    static async getGameRooms() {
      try {
        const gameRooms = await GameRoom.findAll({
          include: [{ model: Player, as: 'players' }]
        })
        return gameRooms
      } catch (error) {
        throw new Error('Failed to fetch game rooms')
      }
    }
  
    static async getGameRoom(roomId: string) {
      try {
        const gameRoom = await GameRoom.findByPk(roomId, {
          include: [{ model: Player, as: 'players' }, { model: Game, as: 'currentGame' }]
        })
        if (!gameRoom) {
          throw new Error('Game room not found')
        }
        return gameRoom
      } catch (error) {
        throw new Error('Failed to fetch game room')
      }
    }
  
    static async makeBet(roomId: string, userId: string, betSize: number) {
      try {
        const gameRoom = await GameRoom.findByPk(roomId, {
          include: [{ model: Player, as: 'players' }]
        })
        if (!gameRoom) {
          throw new Error('Game room not found')
        }
        const player = gameRoom.players.find(p => p.id === userId)
        if (!player) {
          throw new Error('Player not found in this game room')
        }
        if (betSize < gameRoom.minBet || player.bet + betSize > gameRoom.maxBet) {
          throw new Error('Invalid bet size')
        }
        player.bet += betSize
        gameRoom.total_bank += betSize
        await player.save()
        await gameRoom.save()
        return gameRoom
      } catch (error) {
        throw new Error('Failed to make a bet')
      }
    }
  
    static async completeGame(roomId: string) {
      try {
        const gameRoom = await GameRoom.findByPk(roomId, {
          include: [{ model: Player, as: 'players' }]
        })
        if (!gameRoom) {
          throw new Error('Game room not found')
        }
  
        const winner = gameRoom.players.reduce((max, player) => (player.bet > max.bet ? player : max), gameRoom.players[0])
  
        const game = await Game.create({
          gameId: `${roomId}-${Date.now()}`,
          gameRoomId: roomId,
          total_bank: gameRoom.total_bank,
          winner_id: winner.id,
          winnerBetSize: winner.bet,
        })
  
        gameRoom.total_bank = 0
        gameRoom.players.forEach(player => (player.bet = 0))
        gameRoom.currentGameId = game.gameId
        await Promise.all(gameRoom.players.map(player => player.save()))
        await gameRoom.save()
  
        return game
      } catch (error) {
        throw new Error('Failed to complete game')
      }
    }
  }