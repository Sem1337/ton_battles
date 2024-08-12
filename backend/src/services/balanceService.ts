import { Transaction } from 'sequelize';
import sequelize from '../database/db.js';
import { User } from '../database/model/user.js';
import Big from 'big.js';
import jwt from 'jsonwebtoken';

export const generateTonTopUpPayload = (userId: number) => {
  const txPayload = jwt.sign({tag: 'TONBTL', userId: userId }, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' });
  return txPayload
}

export const updateUserBalanceWithTransaction = async (userId: number, amount: Big, transaction?: Transaction) => {
  const user = await User.findByPk(userId, { transaction, lock: transaction?.LOCK.UPDATE });
  if (user) {
    const newBalance = new Big(user.balance).plus(amount);
    if (newBalance.lt(0)) {
      throw new Error('Insufficient balance');
    }
    user.balance = newBalance.toFixed(9);
    await user.save({ transaction });
  }
};

export const updateUserBalance = async (userId: number, amount: Big) => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    if (user) {
      const newBalance = new Big(user.balance).plus(amount);
      if (newBalance.lt(0)) {
        throw new Error('Insufficient balance');
      }
      user.balance = newBalance.toFixed(9);
      await user.save({ transaction });
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updatePoints = async (userId: string) => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });

    if (user) {
      const currentTime = new Big(Date.now()).div(1000).toFixed(0, 0);
      const lastUpdateTime = new Big(user.lastPointsUpdate.getTime()).div(1000).toFixed(0, 0);
      const secondsElapsed = Math.min(Math.max(0, new Big(currentTime).minus(lastUpdateTime).toNumber()), 21600); // 6 hours max
      const pointsIncrease = user.productionLVL * secondsElapsed;

      user.points = new Big(user.points).plus(pointsIncrease).toFixed(0);
      user.lastPointsUpdate = new Date(+currentTime * 1000);

      await user.save({ transaction });

      await transaction.commit();

      return user;
    }
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw new Error('An error occurred while updating points');
  }
  return null;
};

export const updateUserPoints = async (userId: number, points: Big, transaction?: Transaction) => {
  const localTx = !transaction;
  if (localTx) {
    transaction = await sequelize.transaction();
  }
  const user = await User.findByPk(userId, { transaction, lock: transaction?.LOCK.UPDATE });
  if (user) {
    const newBalance = new Big(user.points).plus(points);
    if (newBalance.lt(0)) {
      await transaction?.rollback();
      throw new Error('Insufficient balance');
    }
    user.points = newBalance.toFixed(0);
    await user.save({ transaction });
  }
  if (localTx) {
    await transaction?.commit();
  }
};

export const updateUserGems = async (userId: number, gems: Big, transaction?: Transaction) => {
  const localTx = !transaction;
  if (localTx) {
    transaction = await sequelize.transaction();
  }
  const user = await User.findByPk(userId, { transaction, lock: transaction?.LOCK.UPDATE });
  if (user) {
    const newBalance = new Big(user.gems).plus(gems);
    if (newBalance.lt(0)) {
      await transaction?.rollback();
      throw new Error('Insufficient balance');
    }
    user.gems = newBalance.toNumber();
    await user.save({ transaction });
  }
  if (localTx) {
    await transaction?.commit();
  }
};

export const userLvlUpProduction = async (userId: number, transaction?: Transaction) => {
  const localTx = !transaction;
  if (localTx) {
    transaction = await sequelize.transaction();
  }
  const user = await User.findByPk(userId, { transaction, lock: transaction?.LOCK.UPDATE });
  if (user) {
    user.productionLVL++;
    await user.save({ transaction });
  }
  if (localTx) {
    await transaction?.commit();
  }
};

export const userLvlUpShield = async (userId: number, transaction?: Transaction) => {
  const localTx = !transaction;
  if (localTx) {
    transaction = await sequelize.transaction();
  }
  const user = await User.findByPk(userId, { transaction, lock: transaction?.LOCK.UPDATE });
  if (user) {
    user.shield++;
    await user.save({ transaction });
  }
  if (localTx) {
    await transaction?.commit();
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