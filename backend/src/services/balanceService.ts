import User from '../database/model/user.js';

export const updateUserBalance = async (userId: number, amount: number) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.balance += amount;
    await user.save();
  }
};
