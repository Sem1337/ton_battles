import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
import User from './user.js';

class Player extends Model {
  public id!: string
  public bet!: number
  public name!: string
  public gameRoomId!: string
  public userId!: number;
}

Player.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    bet: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gameRoomId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Player',
  }
)

class Game extends Model {
  public gameId!: string
  public gameRoomId!: string
  public total_bank!: number
  public winner_id!: string
  public winnerBetSize!: number
  public status!: 'active' | 'closed'
}

Game.init(
  {
    gameId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    gameRoomId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_bank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    winner_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    winnerBetSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Game',
  }
)

class GameRoom extends Model {
  public id!: string
  public minBet!: number
  public maxBet!: number
  public maxPlayers!: number
  public status!: 'active' | 'closed'
  public currentGame!: Game
  public players!: Player[]
}

GameRoom.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    minBet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxBet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'GameRoom',
  }
);

// Define associations
GameRoom.hasMany(Player, { as: 'players', foreignKey: 'gameRoomId' });
GameRoom.hasOne(Game, {as: 'currentGame', foreignKey: 'gameRoomId'});
Player.belongsTo(GameRoom, { foreignKey: 'gameRoomId' });
Game.belongsTo(GameRoom, { foreignKey: 'currentGame' });

// Add association between Player and User
Player.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Player, { foreignKey: 'userId' });

export { GameRoom, Player, Game }
