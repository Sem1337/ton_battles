import { User } from '../database/model/user.js';
import { getSocketInstance, userSocketMap } from '../utils/socket.js'

export const sendMessageToUser = (userId: string, messageType: string, payload: any) => {
  const io = getSocketInstance();
  const socketId = userSocketMap.get(userId);

  if (socketId) {
    io.to(socketId).emit('message', { type: messageType, payload: payload });
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
};

export const sendUserInfo = (socket: any, user: User) => {
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
