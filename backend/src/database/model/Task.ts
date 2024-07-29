// models/task.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class Task extends Model {
  public id!: string;
  public taskName!: string;
  public taskDescription!: string;
  public reward!: string;
  public payload!: string;
  public actionType!: 'url' | 'transaction' | 'other';
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    taskDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reward: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actionType: {
      type: DataTypes.ENUM('url', 'transaction', 'other'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Task',
  }
);

export { Task };
