import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class TransactionState extends Model {
  public lastCheckedLt!: string;
}

TransactionState.init({
  lastCheckedLt: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,  // Set as primary key to ensure only one row
  }
}, {
  sequelize,
  tableName: 'transaction_state',
  timestamps: false,
});

export default TransactionState;
