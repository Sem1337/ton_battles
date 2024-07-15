import { GameRoom, Player, Game } from '../database/model/gameRoom.js'
import User from '../database/model/user.js';
import { getSocketInstance } from '../utils/socket.js';
import { updateUserBalance } from './balanceService.js';

export class GameRoomService {
  static gameRoomTimers: { [key: string]: number } = {}; // In-memory storage for remaining time
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
      await game.save();
      await gameRoom.save();

      // Start the game loop
      this.startGameLoop(gameRoom.id);

      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to create game room')
    }
  }

  static async startGameLoop(gameRoomId: string) {
    try {
      const io = getSocketInstance();
      console.log('starting game loop in gameRoom', gameRoomId);
      while (true) {
        const gameRoom = await GameRoom.findByPk(gameRoomId);
        if (!gameRoom || gameRoom.status === 'closed') {
          console.log(`Game loop stopped for room ${gameRoomId} because the room is closed.`);
          break;
        }
        // Initialize the remaining time for the game
        this.gameRoomTimers[gameRoomId] = 60;
        // Start the game
        io.to(gameRoomId).emit('message', { type: 'GAME_STARTED' });

        // Update the remaining time every second
        while (this.gameRoomTimers[gameRoomId] > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.gameRoomTimers[gameRoomId] -= 1;
        }

        await this.completeGame(gameRoomId); // Complete the current game
        if (gameRoom.players.length === 0) {
          gameRoom.status = 'closed';
          await gameRoom.save();
          delete this.gameRoomTimers[gameRoomId];
          console.log(`Game room ${gameRoomId} closed due to no players`);
          break;
        } else {
          gameRoom.players = [];
          await gameRoom.save();
        }

        await this.createNewGame(gameRoomId); // Create a new game
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to start game loop');
    }
  }

  static async completeGame(gameRoomId: string) {
    try {
      console.log('completing game in gameRoom', gameRoomId);
      const gameRoom = await GameRoom.findByPk(gameRoomId, {
        include: [
          { model: Player, as: 'players' },
          { model: Game, as: 'currentGame' }
        ]
      });
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      const game = gameRoom.currentGame;
      if (!game) {
        throw new Error('Current game not found');
      }

      // Determine the winner (example logic: player with the highest bet)
      const winner = gameRoom.players.reduce((max, player) => (player.bet > max.bet ? player : max), gameRoom.players[0]);
      console.log('winner determined')
      // Update the game's winner and status
      game.winner_id = winner.id;
      game.winnerBetSize = winner.bet;
      game.status = 'closed';
      await game.save();

      // Update the winner's user balance
      const winnerUser = await User.findByPk(winner.userId);
      if (winnerUser) {
        winnerUser.balance += game.total_bank;
        await winnerUser.save();
      }

      // Notify players
      const notification = {
        type: 'GAME_COMPLETED',
        payload: { winner: { id: winner.id, name: winner.name, bet: winner.bet }, totalBank: game.total_bank }
      };
      const io = getSocketInstance();
      io.to(gameRoomId).emit('message', notification);

      console.log(`The winner is ${winner.name} with a bet of ${winner.bet}. The total bank of ${game.total_bank} has been credited to their balance.`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to complete game');
    }
  }

  static async createNewGame(gameRoomId: string) {
    try {
      const gameRoom = await GameRoom.findByPk(gameRoomId, {
        include: [{ model: Player, as: 'players' }]
      });
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      // Create a new game
      const newGame = await Game.create({
        gameRoomId: gameRoomId,
        total_bank: 0,
      });
      gameRoom.currentGame = newGame;

      await gameRoom.save();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to create new game');
    }
  }

  static async joinGameRoom(roomId: string, userId: string) {
    try {
      console.log(`${userId} user joins to ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players', include: [{ model: User }] }]
      })
      console.log('game room fetched')
      if (!gameRoom || gameRoom.status === 'closed') {
        throw new Error('Game room not found')
      }
      const io = getSocketInstance();
      // Check if player is already in the game room
      const existingPlayer = gameRoom.players.find(player => player.userId.toString() === userId.toString());
      if (existingPlayer) {
        console.log('Player already in the game room');
        io.to(roomId).emit('message', { type: 'PLAYER_JOINED', payload: { players: gameRoom.players, remainingTime: this.gameRoomTimers[roomId] } });
        return gameRoom;
      }
      if (gameRoom.players.length >= gameRoom.maxPlayers) {
        throw new Error('Game room is full')
      }
      const player = await Player.create({
        bet: 0,
        name: `Player${userId}`,
        gameRoomId: roomId,
        userId: userId
      })
      console.log('player created')
      gameRoom.players.push(player)
      await gameRoom.save()
      
      io.to(roomId).emit('message', { type: 'PLAYER_JOINED', payload: { players: gameRoom.players, remainingTime: this.gameRoomTimers[roomId] } });

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
        where: { status: 'active' }, // Only fetch active game rooms
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
      console.log(gameRoom.players[0].toJSON())
      const player = gameRoom.players.find(p => p.userId.toString() === userId.toString())
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
      updateUserBalance(+userId, -betSize);
      player.bet += betSize
      game.total_bank += betSize
      await player.save()
      await game.save()
      await gameRoom.save()
      // Notify clients of the bet made
      const io = getSocketInstance();
      io.to(roomId).emit('message', { type: 'BET_MADE', payload: gameRoom.players });

      return gameRoom
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to make a bet')
    }
  }

}