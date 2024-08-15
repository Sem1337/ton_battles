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
  timestamps: false,
  hooks: {
    beforeCreate: async (_instance, options) => {
      // Prevent multiple entries by throwing an error if an entry already exists
      const existing = await TransactionState.findOne({ transaction: options.transaction });
          if (existing) {
              throw new Error('Attempting to create a new TransactionState entry when one already exists.');
          }
    }
  }
});

export default TransactionState;
