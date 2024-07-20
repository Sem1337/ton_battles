import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class User extends Model {
  public userId!: number;
  public balance!: string;
  public points!: string; // Add this line
  public gems!: number;
  public productionLVL!: number;
  public shield!: number;
  public lastPointsUpdate!: Date; // Add this line

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0.0,
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

  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export { User };
