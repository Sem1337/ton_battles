import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
import { User } from './user.js';

class Player extends Model {
  public id!: string;
  public bet!: string;
  public name!: string;
  public gameRoomId!: string;
  public shield!: number;
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
      type: DataTypes.STRING,
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
    shield: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Set default value to 0
      allowNull: false,
      validate: {
        min: 0,
        max: 4
      },
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Player',
    indexes: [
      {
        unique: true,
        fields: ['gameRoomId', 'userId']
      }
    ]
  }
)

class Game extends Model {
  public gameId!: string;
  public gameRoomId!: string;
  public total_bank!: string;
  public winner_id!: string;
  public winnerBetSize!: string;
  public status!: 'active' | 'closed';
  public readonly createdAt!: Date;
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    winner_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    winnerBetSize: {
      type: DataTypes.STRING,
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
  public id!: string;
  public gameType!: 'points' | 'gems' | 'TON';
  public minBet!: string;
  public maxBet!: string;
  public maxPlayers!: number;
  public status!: 'active' | 'closed';
  public currentGame!: Game;
  public players!: Player[];
  public roomName!: string; // Add this line
  public currentPlayers!: number;
}

GameRoom.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    gameType: {
      type: DataTypes.ENUM('points', 'gems', 'TON'),
      allowNull: false,
    },
    minBet: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 0.1,
      },
    },
    maxBet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
    roomName: { // Add this field
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
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
