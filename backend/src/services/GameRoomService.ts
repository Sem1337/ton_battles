import sequelize from '../database/db.js';
import { GameRoom, Player, Game } from '../database/model/gameRoom.js'
import User from '../database/model/user.js';
import { getSocketInstance } from '../utils/socket.js';
import { updateUserBalance, updateUserBalanceWithTransaction } from './balanceService.js';
import Big from 'big.js'; // Import Big.js
import { Op, Order } from 'sequelize';

export class GameRoomService {
  static gameRoomTimers: { [key: string]: number } = {}; // In-memory storage for remaining time
  static async createGameRoom(minBet: number, maxBet: number, maxPlayers: number, roomName: string) {
    try {
      console.log('creating game room: ', minBet, maxBet, maxPlayers);
      const gameRoom = await GameRoom.create({
        minBet,
        maxBet,
        maxPlayers,
        roomName,
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
        // Initialize the remaining time for the game
        this.gameRoomTimers[gameRoomId] = 60;
        // Start the game
        io.to(gameRoomId).emit('message', { type: 'GAME_STARTED' });

        // Update the remaining time every second
        while (this.gameRoomTimers[gameRoomId] > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.gameRoomTimers[gameRoomId] -= 1;
        }

        const gameRoom = await this.completeGame(gameRoomId); // Complete the current game
        if (!gameRoom || gameRoom.status === 'closed') {
          console.log(`Game loop stopped for room ${gameRoomId} because the room is closed.`);
          break;
        }
        if (gameRoom.players.length === 0) {
          gameRoom.status = 'closed';
          await gameRoom.save();
          delete this.gameRoomTimers[gameRoomId];
          console.log(`Game room ${gameRoomId} closed due to no players`);
          break;
        } else {
          await Player.destroy({ where: { gameRoomId } });
          gameRoom.players = []
          console.log(gameRoom.toJSON());
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

      if (gameRoom.players.length == 0) {
        game.status = 'closed';
        await game.save();
        console.log('no players, no winner');
        return gameRoom
      }
      const io = getSocketInstance();
      let winner = null
      if (gameRoom.players.length > 1) {
        // Determine the winner (example logic: player with the highest bet)
        winner = gameRoom.players.reduce((max, player) => (player.bet > max.bet ? player : max), gameRoom.players[0]);
        console.log('winner determined')
        // Update the game's winner and status
        game.winner_id = winner.id;
        game.winnerBetSize = winner.bet;

        // Update the winner's user balance
        await updateUserBalance(winner.userId, new Big(game.total_bank))
        console.log(`The winner is ${winner.name} with a bet of ${winner.bet}. The total bank of ${game.total_bank} has been credited to their balance.`);
      } else {
        if (new Big(game.total_bank).gt(0)) {
          await updateUserBalance(gameRoom.players[0].userId, new Big(game.total_bank));
        }
        console.log('sending NOTIFY');
        io.to(gameRoomId).emit('message', { type: 'NOTIFY', payload: { message: 'Not enough players for battle. Bet returned to your balance' } });

      }
      // Notify players
      const gameResult = {
        type: 'GAME_COMPLETED',
        payload: { winner: winner ? { id: winner.id, name: winner.name, bet: winner.bet } : null, totalBank: game.total_bank }
      };
      io.to(gameRoomId).emit('message', gameResult);
      game.status = 'closed';
      await game.save();
      return gameRoom
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
    const transaction = await sequelize.transaction();
    try {
      console.log(`${userId} user joins to ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players', include: [{ model: User }] }],
        transaction
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
        await transaction.commit();
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
      }, { transaction })
      console.log('player created')
      gameRoom.players.push(player)
      await gameRoom.save({ transaction })

      io.to(roomId).emit('message', { type: 'PLAYER_JOINED', payload: { players: gameRoom.players, remainingTime: this.gameRoomTimers[roomId] } });

      console.log('success')
      await transaction.commit();
      return gameRoom
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to join game room')
    }
  }

  static async getGameRooms({ page = 1, limit = 10, sort = 'roomName', filter = '' }) {
    try {
      const offset = (page - 1) * limit;
      const where = {
        roomName: {
          [Op.like]: `%${filter}%`
        },
        status: 'active'
      };
      const order: Order = [[sort, 'ASC']];
      const gameRooms = await GameRoom.findAndCountAll({
        where,
        order,
        limit,
        offset,
        include: [{ model: Player, as: 'players' }]
      });
      return {
        data: gameRooms.rows,
        total: gameRooms.count,
        page,
        limit
      };
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
    const transaction = await sequelize.transaction();
    try {
      console.log(`${userId} bet ${betSize} TON in ${roomId}`)
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }, { model: Game, as: 'currentGame' }],
        transaction
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
      if (new Big(player.bet).plus(betSize).lt(gameRoom.minBet) || new Big(player.bet).plus(betSize).gt(gameRoom.maxBet) || new Big(betSize).lt(0.1)) {
        throw new Error('Invalid bet size');
      }
      await updateUserBalanceWithTransaction(+userId, new Big(-betSize), transaction); // Update balance using Big.js
      player.bet = new Big(player.bet).plus(betSize).toFixed(9); // Update player's bet using Big.js
      game.total_bank = new Big(game.total_bank).plus(betSize).toFixed(9); // Update game's total bank using Big.js
      await player.save({ transaction });
      await game.save({ transaction });
      await gameRoom.save({ transaction });
      await transaction.commit();
      // Notify clients of the bet made
      const io = getSocketInstance();

      io.to(roomId).emit('message', { type: 'BET_MADE', payload: gameRoom.players });

      return gameRoom
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to make a bet')
    }
  }

}