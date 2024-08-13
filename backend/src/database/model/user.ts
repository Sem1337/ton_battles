import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
import { Task } from './Task.js'

class User extends Model {
  public userId!: number;
  public username!: string;
  public balance!: string;
  public points!: string; // Add this line
  public gems!: number;
  public productionLVL!: number;
  public shield!: number;
  public lastPointsUpdate!: Date; // Add this line
  public referredBy?: number; // Add referredBy field
  public referrals!: User[];
  public completedTasks!: Task[]; // Add this line

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    userId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0.0,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'username',
    },
    points: {
      type: DataTypes.STRING,
      defaultValue: 0, // Set default value to 0
      allowNull: false,
    },
    gems: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Set default value to 0
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    productionLVL: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Set default value to 0
      allowNull: false,
      validate: {
        min: 0,
      }
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
    lastPointsUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Set default value to the current date
      allowNull: false,
    },
    referredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

class UserSocket extends Model {
  public userId!: number;
  public socketId!: string;
}

UserSocket.init(
  {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'UserSocket',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'socketId'],
      },
    ],
  }
);

User.hasMany(User, {
  sourceKey: 'userId',
  foreignKey: 'referredBy',
  as: 'referrals',
});

User.belongsToMany(Task, { through: 'UserTasks', as: 'completedTasks' });
Task.belongsToMany(User, { through: 'UserTasks' });

export { User, UserSocket };
