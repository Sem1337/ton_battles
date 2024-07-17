import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
import { User } from './user.js';

class Player extends Model {
  public id!: string
  public bet!: string
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
    userId: {
      type: DataTypes.INTEGER,
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
  public gameId!: string
  public gameRoomId!: string
  public total_bank!: string
  public winner_id!: string
  public winnerBetSize!: string
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
  public id!: string
  public minBet!: string
  public maxBet!: string
  public maxPlayers!: number
  public status!: 'active' | 'closed'
  public currentGame!: Game
  public players!: Player[]
  public roomName!: string // Add this line
  public currentPlayers!: number
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxBet: {
      type: DataTypes.STRING,
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
