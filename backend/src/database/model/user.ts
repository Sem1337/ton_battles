import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class User extends Model {
  public id!: number;
  public balance!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
