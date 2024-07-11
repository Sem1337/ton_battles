import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateWebSocket } from '../auth.js';
import { GameRoomService } from '../services/GameRoomService.js';
import User from '../database/model/user.js';

let io: SocketIOServer;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: 'https://sem1337.github.io',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token) {
      try {
        const decoded = authenticateWebSocket(token as string);
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.data.user);

    socket.on('MAKE_BET', async (data) => {
      const { betSize, roomId } = data;
      if (roomId) {
        const gameRoom = await GameRoomService.makeBet(roomId, socket.data.user.userId, betSize);
        io.to(roomId).emit('BET_MADE', { players: gameRoom.players });
      } else {
        socket.emit('ERROR', { message: 'User not in a room' });
      }
    });

    socket.on('LEAVE_ROOM', async (data) => {
      const { roomId } = data;
      if (roomId) {
        await GameRoomService.leaveGameRoom(roomId, socket.data.user.userId);
        socket.emit('LEFT_ROOM');
      } else {
        socket.emit('ERROR', { message: 'User not in a room' });
      }
    });

    socket.on('GET_BALANCE', async () => {
      const user = await User.findByPk(socket.data.user.userId);
      if (user) {
        socket.emit('BALANCE_UPDATE', { balance: user.balance });
      } else {
        socket.emit('ERROR', { message: 'User not found' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.data.user);
    });

    socket.emit('CONNECTED');
  });

  return io;
};

export const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
