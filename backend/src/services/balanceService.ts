import User from '../database/model/user.js';

export const updateUserBalance = async (userId: number, amount: number) => {
  const user = await User.findOne({ where: { userId } });
  if (user) {
    user.balance += amount;
    await user.save();
  }
};

export const getUserBalance = async (userId: number) => {
  const user = await User.findOne({ where: { userId } });
  if (user) {
    return user.balance;
  }
  return 0;
};
