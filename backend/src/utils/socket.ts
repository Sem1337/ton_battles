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


    socket.on('message', async (data: { type: string, payload: any }) => {
      const { type, payload } = data;

      console.log(`received message of type ${type}`);
      
      try {
        switch (type) {
          case 'MAKE_BET':
            const { roomId, betSize } = payload;
            await GameRoomService.makeBet(roomId, socket.data.user.userId, betSize);
            io.to(roomId).emit('message', { type: 'BET_MADE', payload: { userId: socket.data.user.userId, roomId, betSize } });
            break;
        
          case 'LEAVE_ROOM':
            const { roomId: leaveRoomId } = payload;
            await GameRoomService.leaveGameRoom(leaveRoomId, socket.data.user.userId);
            io.to(leaveRoomId).emit('message', { type: 'PLAYER_LEFT', payload: { userId: socket.data.user.userId, roomId: leaveRoomId } });
            break;
        
          case 'GET_BALANCE':
            const user = await User.findByPk(socket.data.user.userId);
            if (user) {
              socket.emit('message', { type: 'BALANCE_UPDATE', payload: user.balance });
            } else {
              socket.emit('message', { type: 'ERROR', payload: { message: 'User not found' } });
            }
            break;
        
          default:
            socket.emit('message', { type: 'ERROR', payload: { message: 'Unknown message type' } });
        }
      } catch (error) {
        if (error instanceof Error) {
          socket.emit('message', { type: 'ERROR', payload: { message: error.message } });
        } else {
          socket.emit('message', { type: 'ERROR', payload: { message: 'An unknown error occurred' } });
        }
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
