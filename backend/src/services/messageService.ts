import { User } from '../database/model/user.js';
import { getSocketInstance } from '../utils/socket.js'
import { UserSocket } from '../database/model/user.js';

export const sendMessageToUser = async (userId: string, messageType: string, payload: any) => {
  const io = getSocketInstance();
  const userSocket = await UserSocket.findOne({ where: { userId } });
  const socketId = userSocket?.socketId;

  if (socketId) {
    io.to(socketId).emit('message', { type: messageType, payload: payload });
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
};

export const sendNotificationToUser = async (userId: string, payload: any) => {
  const io = getSocketInstance();
  const userSocket = await UserSocket.findOne({ where: { userId } });
  const socketId = userSocket?.socketId;

  if (socketId) {
    io.to(socketId).emit('NOTIFY', payload);
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
};

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

export const sendUserInfo = async (userId: number) => {
  const io = getSocketInstance();
  const userSocket = await UserSocket.findOne({ where: { userId } });
  const socketId = userSocket?.socketId;
  const user = await User.findByPk(userId);
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