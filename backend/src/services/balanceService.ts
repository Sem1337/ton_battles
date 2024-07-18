import sequelize from '../database/db.js';
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
      const currentTime = (Date.now() / 1000).toFixed(0);
      const lastUpdateTime = (user.lastPointsUpdate.getTime() / 1000).toFixed(0);
      const secondsElapsed = Math.min(+currentTime - +lastUpdateTime, 21600); // 6 hours max 
      const pointsIncrease = user.productionLVL * secondsElapsed;

      user.points = new Big(user.points).plus(pointsIncrease).toString();
      user.lastPointsUpdate = new Date(+currentTime * 1000);

      await user.save();

      return user.points;
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating points');
  }
  return 0;
};

export const productionLvlUpWithPoints = async (userId: number, points: Big) => {
  const transaction = await sequelize.transaction();
  const user = await User.findByPk(userId);
  if (user) {
    const newPoints : Big = new Big(user.points).minus(points);
    if (newPoints.lt(0)) {
      await transaction.rollback();
      return;
    }
    user.productionLVL++;
    user.points = newPoints.toFixed(6);
    await user.save({transaction});
    await transaction.commit();
    return;
  }
  await transaction.rollback();
  return;
};

export const productionLvlUpWithGems = async (userId: number, gems: Big) => {
  const transaction = await sequelize.transaction();
  const user = await User.findByPk(userId);
  if (user) {
    const newGems : Big = new Big(user.gems).minus(gems);
    if (newGems.lt(0)) {
      await transaction.rollback();
      return;
    }
    user.productionLVL++;
    user.gems = newGems.toNumber();
    await user.save({transaction});
    await transaction.commit();
    return;
  }
  await transaction.rollback();
  return;
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
