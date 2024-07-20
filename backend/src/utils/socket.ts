import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateWebSocket } from '../auth.js';
import { GameRoomService } from '../services/GameRoomService.js';
import { User } from '../database/model/user.js';
import { updatePoints } from '../services/balanceService.js';

let io: SocketIOServer;

export const userSocketMap = new Map();

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
        console.log('decoded jwtToken in websocket', socket.data.user);
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
    // Store the user's socket ID
    const userId = socket.data.user.userId;
    userSocketMap.set(userId, socket.id);
    socket.on('join', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });


    socket.on('message', async (data: { type: string, payload: any }) => {
      const { type, payload } = data;

      console.log(`received message of type ${type}`);

      try {
        switch (type) {
          case 'join': {
            socket.join(payload);
            console.log(`Socket ${socket.id} joined room ${payload}`);
            break;
          }
          case 'leave': {
            socket.leave(payload);
            console.log(`Socket ${socket.id} left room ${payload}`);
            break;
          }
          case 'UPDATE_POINTS': {
            const newPoints = await updatePoints(socket.data.user.userId);
            socket.emit('message', { type: 'POINTS_UPDATED', payload: { points: newPoints.points, productionSpeed: newPoints.productionSpeed } });
            break;
          }
          case 'JOIN_GAME': {
            const { roomId } = payload;
            await GameRoomService.joinGameRoom(roomId, socket.data.user.userId);
            break;
          }
          case 'MAKE_BET': {
            const { roomId, betSize } = payload;
            await GameRoomService.makeBet(roomId, socket.data.user.userId, betSize);
            const user = await User.findByPk(socket.data.user.userId);
            if (user) {
              socket.emit('message', { type: 'BALANCE_UPDATE', payload: { balance: user.balance, points: user.points } });
            }
            break;
          }
          case 'GET_BALANCE': {
            const user = await User.findByPk(socket.data.user.userId);
            if (user) {
              socket.emit('message', { type: 'BALANCE_UPDATE', payload: { balance: user.balance, points: user.points } });
            } else {
              socket.emit('message', { type: 'ERROR', payload: { message: 'User not found' } });
            }
            break;
          }
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
      userSocketMap.delete(userId);
    });

    socket.emit('message', { type: 'CONNECTED' });
  });

  return io;
};

export const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
