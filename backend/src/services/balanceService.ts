import User from '../database/model/user.js';
import Big from 'big.js';

export const updateUserBalanceWithTransaction = async (userId: number, amount: Big, transaction: any) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.balance = new Big(user.balance).plus(amount).toFixed(9);
    await user.save({ transaction });
  }
};

export const updateUserBalance = async (userId: number, amount: Big) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.balance = new Big(user.balance).plus(amount).toFixed(9);
    await user.save();
  }
};

export const getUserBalance = async (userId: number) => {
  const user = await User.findOne({ where: { userId } });
  console.log('user id:', userId);

  if (user) {
    console.log('balance:', user.balance);
    return user.balance;
  }
  return 0;
};
