// models/task.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class Task extends Model {
  public id!: string;
  public taskName!: string;
  public taskDescription!: string;
  public reward!: string;
  public url!: string;
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Task',
  }
);

export { Task };
