import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class GameRoom extends Model {
  public gameId!: number;
  public total_bank!: number;
  public winner!: string | null;
  public time_of_start!: Date;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GameRoom.init(
  {
    gameId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total_bank: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    winner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    time_of_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('beginning', 'finished'),
      allowNull: false,
      defaultValue: 'beginning',
    },
  },
  {
    sequelize,
    tableName: 'game_rooms',
    timestamps: true,
  }
);

export default GameRoom;
