import { GameRoom, Player, Game } from '../database/model/gameRoom.js'

export class GameRoomService {
  static async createGameRoom(minBet: number, maxBet: number, maxPlayers: number) {
    try {
      console.log('creating game room: ', minBet, maxBet, maxPlayers);
      const gameRoom = await GameRoom.create({
        minBet,
        maxBet,
        maxPlayers,
        status: 'active',
      })
      // Create initial game
      const game = await Game.create({
        gameRoomId: gameRoom.id,
        total_bank: 0,
      })
      gameRoom.currentGame = game;
      await gameRoom.save();
      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to create game room')
    }
  }

  static async joinGameRoom(roomId: string, userId: string) {
    try {
      console.log(`${userId} user joins to ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }]
      })
      if (!gameRoom) {
        throw new Error('Game room not found')
      }
      if (gameRoom.players.length >= gameRoom.maxPlayers) {
        throw new Error('Game room is full')
      }
      const player = await Player.create({
        userId: userId,
        bet: 0,
        name: `Player${userId}`,
        gameRoomId: roomId,
      })
      gameRoom.players.push(player)
      await gameRoom.save()
      console.log('success')
      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
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
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to fetch game rooms')
    }
  }

  static async getGameRoom(roomId: string) {
    try {
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }]
      })
      if (!gameRoom) {
        throw new Error('Game room not found')
      }
      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to fetch game room')
    }
  }

  static async makeBet(roomId: string, userId: string, betSize: number) {
    try {
      console.log(`${userId} bet ${betSize} TON in ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }, { model: Game, as: 'currentGame' }],
      })
      if (!gameRoom) {
        throw new Error('Game room not found')
      }
      console.log('players count: ', gameRoom.players.length)
      const player = gameRoom.players.find(p => p.userId === userId.toString())
      if (!player) {
        throw new Error('Player not found in this game room')
      }
      const game = gameRoom.currentGame
      if (!game) {
        throw new Error('Game not found')
      }
      if (betSize < gameRoom.minBet || player.bet + betSize > gameRoom.maxBet) {
        throw new Error('Invalid bet size')
      }
      player.bet += betSize
      game.total_bank += betSize
      await player.save()
      await game.save()
      await gameRoom.save()
      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
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

      const game = gameRoom.currentGame;
      game.winner_id = winner.id
      game.winnerBetSize = winner.bet
      game.status = 'closed';
      await game.save()

      gameRoom.players.forEach(player => (player.bet = 0))

      // Create a new game for the next cycle
      const newGame = await Game.create({
        gameRoomId: roomId,
        total_bank: 0,
      })

      gameRoom.currentGame = newGame;
      await Promise.all(gameRoom.players.map(player => player.save()))
      await gameRoom.save()

      return game
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to complete game')
    }
  }


  static async leaveGameRoom(roomId: string, userId: string) {
    try {
      console.log(`${userId} user leaves ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }]
      })
      if (!gameRoom) {
        throw new Error('Game room not found')
      }
      const playerIndex = gameRoom.players.findIndex(p => p.userId === userId.toString())
      if (playerIndex === -1) {
        throw new Error('Player not found in this game room')
      }
      await gameRoom.players[playerIndex].destroy()
      gameRoom.players.splice(playerIndex, 1)
      await gameRoom.save()
      console.log('Player successfully left the game room')
      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to leave game room')
    }
  }

}