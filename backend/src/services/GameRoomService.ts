import sequelize from '../database/db.js';
import { GameRoom, Player, Game } from '../database/model/gameRoom.js'
import { User } from '../database/model/user.js';
import { getSocketInstance } from '../utils/socket.js';
import { updateUserBalanceWithTransaction, updateUserGems, updateUserPoints } from './balanceService.js';
import Big from 'big.js'; // Import Big.js
import { col, Op, Order } from 'sequelize';

export class GameRoomService {
  static gameRoomTimers: { [key: string]: number } = {}; // In-memory storage for remaining time
  static async createGameRoom(gameType: 'points' | 'gems' | 'TON', minBet: string, maxBet: string, maxPlayers: number, roomName: string) {
    try {
      const maxBetValue = maxBet === 'Infinity' ? null : maxBet;
      if (maxBetValue && new Big(maxBetValue).lt(minBet) ||
          maxPlayers < 2 || maxPlayers > 100 || new Big(minBet).lte(0)) {
        throw new Error('Failed to create game room');
      }
      console.log('creating game room: ', gameType, minBet, maxBet, maxPlayers);
      const gameRoom = await GameRoom.create({
        gameType,
        minBet,
        maxBet: maxBetValue,
        maxPlayers,
        roomName,
        status: 'active',
      });

      // Create initial game
      const game = await Game.create({
        gameRoomId: gameRoom.id,
        total_bank: 0,
      });
      gameRoom.currentGame = game;
      await game.save();
      await gameRoom.save();

      // Start the game loop
      this.startGameLoop(gameRoom.id);

      return gameRoom;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to create game room');
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
          gameRoom.players = [];
          gameRoom.currentPlayers = 0;
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

      if (gameRoom.players.length === 0) {
        game.status = 'closed';
        await game.save();
        console.log('no players, no winner');
        return gameRoom;
      }
      const io = getSocketInstance();
      let winner = null;
      if (gameRoom.players.length > 1) {
        // Determine the winner
        const playersWithChances = gameRoom.players.map(player => {
          const playerBet = new Big(player.bet);
          const winChance = playerBet.div(game.total_bank).mul(100).toNumber(); // Normalize player's chance to win in percentage
          const shieldThreshold = 100 - player.shield * 10; // Threshold based on player's shield
          return { player, winChance, shieldThreshold };
        });

        // First attempt to find a winner based on shield criteria
        for (const { player, winChance, shieldThreshold } of playersWithChances) {
          if (winChance >= shieldThreshold) {
            winner = player;
            break;
          }
        }

        // If no winner was found based on shield criteria, use weighted random selection
        if (!winner) {
          const totalWinChance = 100;
          let random = Math.random() * totalWinChance;
          for (const { player, winChance } of playersWithChances) {
            if (random < winChance) {
              winner = player;
              break;
            }
            random -= winChance;
          }
        }
        console.log('winner determined');
        if (!winner) {
          winner = gameRoom.players[0];
        }
        // Update the game's winner and status
        game.winner_id = winner.id;
        game.winnerBetSize = winner.bet;

        // Update the winner's user balance
        await this.updateUserBalanceByGameType(winner.userId, gameRoom.gameType, new Big(game.total_bank));
        console.log(`The winner is ${winner.name} with a bet of ${winner.bet}. The total bank of ${game.total_bank} has been credited to their balance.`);
      } else {
        if (new Big(game.total_bank).gt(0)) {
          await this.updateUserBalanceByGameType(gameRoom.players[0].userId, gameRoom.gameType, new Big(game.total_bank));
        }
        console.log(`The winner is ${gameRoom.players[0].userId} with a bet of ${gameRoom.players[0].bet}. The total bank of ${game.total_bank} has been credited to their balance.`);
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
      return gameRoom;
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
      console.log(`${userId} user joins to ${roomId}`);
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players', include: [{ model: User }] }],
        transaction
      });
      console.log('game room fetched');
      if (!gameRoom || gameRoom.status === 'closed') {
        throw new Error('Game room not found');
      }
      const io = getSocketInstance();
      // Check if player is already in the game room
      const existingPlayer = gameRoom.players.find(player => player.userId.toString() === userId.toString());
      if (!this.gameRoomTimers[roomId]) {
        this.gameRoomTimers[roomId] = 60;
      }
      if (existingPlayer) {
        console.log('Player already in the game room');
        console.log('remainingTime', this.gameRoomTimers[roomId]);
        io.to(roomId).emit('message', { type: 'PLAYER_JOINED', payload: { players: gameRoom.players, remainingTime: this.gameRoomTimers[roomId], roomName: gameRoom.roomName } });
        await transaction.commit();
        return gameRoom;
      }
      if (gameRoom.players.length >= gameRoom.maxPlayers) {
        io.to(roomId).emit('message', { type: 'NOTIFY', payload: { message: 'Room is already full!' } });
        throw new Error('Game room is full');
      }
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('user not found');
      }
      const player = await Player.create({
        bet: 0,
        name: `${user.username}`,
        gameRoomId: roomId,
        shield: user.shield,
        userId: userId
      }, { transaction });
      console.log('player created');
      gameRoom.currentPlayers++;
      gameRoom.players.push(player);
      await gameRoom.save({ transaction });

      console.log('remainingTime', this.gameRoomTimers[roomId]);
      io.to(roomId).emit('message', { type: 'PLAYER_JOINED', payload: { players: gameRoom.players, remainingTime: this.gameRoomTimers[roomId], roomName: gameRoom.roomName } });

      console.log('success');
      await transaction.commit();
      return gameRoom;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to join game room');
    }
  }

  static async getGameRooms({ page = 1, limit = 10, sort = 'roomName', filter = '', gameType = 'points' }) {
    try {
      const offset = (page - 1) * limit;
      const where = {
        roomName: {
          [Op.like]: `%${filter}%`
        },
        status: 'active',
        currentPlayers: {
          [Op.lt]: col('maxPlayers')
        },
        gameType: gameType
      };
      const order: Order = [[sort, 'ASC']];
      const gameRooms = await GameRoom.findAndCountAll({
        where,
        order,
        limit,
        offset,
        include: [{ model: Player, as: 'players', attributes: [] }]
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
      throw new Error('Failed to fetch game rooms');
    }
  }

  static async getGameRoom(roomId: string) {
    try {
      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [{ model: Player, as: 'players' }]
      });
      if (!gameRoom) {
        throw new Error('Game room not found');
      }
      return gameRoom;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to fetch game room');
    }
  }

  static async makeBet(roomId: string, userId: string, betSize: number) {
    const transaction = await sequelize.transaction();
    try {
      console.log(`${userId} bet ${betSize} in ${roomId}`);

      const gameRoom = await GameRoom.findByPk(roomId, {
        include: [
          { model: Player, as: 'players' },
          {
            model: Game,
            as: 'currentGame',
          }
        ],
        transaction,
      });
      if (!gameRoom) {
        throw new Error('Game room not found');
      }
      console.log('players count: ', gameRoom.players.length);
      const player = gameRoom.players.find(p => p.userId.toString() === userId.toString());
      if (!player) {
        throw new Error('Player not found in this game room');
      }

      if (!gameRoom.currentGame) {
        throw new Error('Game not found');
      }
      const game = await Game.findByPk(gameRoom.currentGame.gameId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      // Validate bet size considering maxBet can be null for unlimited bet
      if (
        new Big(player.bet).plus(betSize).lt(gameRoom.minBet) ||
        (gameRoom.maxBet !== null && new Big(player.bet).plus(betSize).gt(gameRoom.maxBet)) ||
        new Big(betSize).lt(0.1)
      ) {
        throw new Error('Invalid bet size');
      }

      await this.updateUserBalanceByGameType(+userId, gameRoom.gameType, new Big(-betSize), transaction); // Update balance using Big.js
      player.bet = new Big(player.bet).plus(betSize).toFixed(9); // Update player's bet using Big.js
      game!.total_bank = new Big(game!.total_bank).plus(betSize).toFixed(9); // Update game's total bank using Big.js
      await player.save({ transaction });
      await game!.save({ transaction });
      await gameRoom.save({ transaction });
      await transaction.commit();
      // Notify clients of the bet made
      const io = getSocketInstance();

      io.to(roomId).emit('message', { type: 'BET_MADE', payload: { players: gameRoom.players, totalbank: game!.total_bank} });

      return gameRoom;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new Error('Failed to make a bet');
    }
  }

  static async updateUserBalanceByGameType(userId: number, gameType: 'points' | 'gems' | 'TON', amount: Big, transaction?: any) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    switch (gameType) {
      case 'points':
        await updateUserPoints(+userId, amount, transaction);
        break;
      case 'gems':
        await updateUserGems(+userId, amount, transaction);
        break;
      case 'TON':
        await updateUserBalanceWithTransaction(+userId, amount, transaction);
        return;
      default:
        throw new Error('Invalid game type');
    }

    await user.save({ transaction });
  }

}