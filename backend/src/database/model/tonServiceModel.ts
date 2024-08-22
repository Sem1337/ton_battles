import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class TransactionState extends Model {
  public id!: string;
  public lastCheckedLt!: string;
}

TransactionState.init({
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  lastCheckedLt: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: false,  // Set as primary key to ensure only one row
  }
}, {
  sequelize,
  tableName: 'transaction_state',
  timestamps: false,
});


class HandledTransactions extends Model {
  public lt!: string;
}

HandledTransactions.init({
  lt: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  timestamps: false,
})

export { TransactionState, HandledTransactions };
