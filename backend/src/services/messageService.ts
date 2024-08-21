import { User } from '../database/model/user.js';
import { getSocketInstance } from '../utils/socket.js'
import redisClient from '../utils/redisClient.js';
import { Transaction } from 'sequelize';

export const sendMessageToUser = async (userId: string, messageType: string, payload: any) => {
  const io = getSocketInstance();
  const socketId = await redisClient.get(`socket:${userId}`);

  if (socketId) {
    io.to(socketId).emit('message', { type: messageType, payload: payload });
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
};

export const sendNotificationToUser = async (userId: string, payload: any) => {
  await sendMessageToUser(userId, 'NOTIFY', payload);
};

export const sendMessageToGameRoom = async (gameRoomId: string, messageType: string , payload: any) => {
  const io = getSocketInstance();
  io.to(gameRoomId).emit('message', {type: messageType, payload: payload});
}

export const sendNotificationToGameRoom = async (gameRoomId: string, message: string) => {
  await sendMessageToGameRoom(gameRoomId, 'NOTIFY', {message: message});
}

export const sendUserInfoToSocket = (socket: any, user: User) => {
  socket.emit('message', {
    type: 'USER_INFO',
    payload: {
      balance: user.balance,
      points: user.points,
      gems: user.gems,
      productionSpeed: user.productionLVL,
      shieldLVL: user.shield
    }
  });
};

export const sendUserInfo = async (userId: number, transaction?: Transaction) => {
  const io = getSocketInstance();
  const socketId = await redisClient.get(`socket:${userId}`);
  const user = await User.findByPk(userId, {transaction});
  if (socketId && user) {
    const payload = {
      balance: user.balance,
      points: user.points,
      gems: user.gems,
      productionSpeed: user.productionLVL,
      shieldLVL: user.shield
    };
    io.to(socketId).emit('message', { type: 'USER_INFO', payload: payload });
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
};