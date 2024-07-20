import { User } from '../database/model/user.js';
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

export const updatePoints = async (userId: string) => {
  try {
    const user = await User.findByPk(userId);
    if (user) {
      const currentTime = new Big(Date.now()).div(1000).toFixed(0,0);
      const lastUpdateTime = new Big(user.lastPointsUpdate.getTime()).div(1000).toFixed(0,0);
      const secondsElapsed = Math.min(Math.max(0,new Big(currentTime).minus(lastUpdateTime).toNumber()), 21600); // 6 hours max
      const pointsIncrease = user.productionLVL * secondsElapsed;

      user.points = new Big(user.points).plus(pointsIncrease).toFixed(0);
      user.lastPointsUpdate = new Date(+currentTime * 1000);

      await user.save();

      return { points: user.points, productionSpeed: user.productionLVL };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating points');
  }
  return { points: 0, productionSpeed: 0 };
};


export const updateUserPoints = async (userId: number, points: Big) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.points = new Big(user.points).plus(points).toFixed(6);
    await user.save();
  }
};

export const updateUserGems = async (userId: number, gems: Big) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.gems = new Big(user.points).plus(gems).toNumber();
    await user.save();
  }
};

export const userLvlUpProduction = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.productionLVL++;
    await user.save();
  }
};

export const userLvlUpShield = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.shield++;
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
