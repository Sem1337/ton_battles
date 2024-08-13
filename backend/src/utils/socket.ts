import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { authenticateWebSocket } from '../auth.js';
import { GameRoomService } from '../services/GameRoomService.js';
import { User, UserSocket } from '../database/model/user.js';
import { updatePoints } from '../services/balanceService.js';
import { sendUserInfoToSocket } from '../services/messageService.js';

let io: SocketIOServer;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ['https://sem1337.github.io', 'https://www.tonbattles.ru'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Set up Redis clients for pub/sub
  const pubClient = createClient({ url: 'redis://redis:6379' });
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

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

  io.on('connection', async (socket) => {
    console.log('A user connected', socket.data.user);
    // Store the user's socket ID
    const userId = socket.data.user.userId;
    // Store the user's socket ID in the database
    await UserSocket.create({ userId, socketId: socket.id });

    // Broadcast the current number of online users
    const onlineUsersCount = await UserSocket.count();
    socket.emit('onlineUsers', { count: onlineUsersCount });

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
            const newUserData = await updatePoints(socket.data.user.userId);
            if (newUserData) {
              sendUserInfoToSocket(socket, newUserData)
            } else {
              socket.emit('message', { type: 'ERROR', payload: { message: 'User not found' } });
            }
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
              sendUserInfoToSocket(socket, user);
            }
            break;
          }
          case 'GET_BALANCE': {
            const user = await User.findByPk(socket.data.user.userId);
            if (user) {
              sendUserInfoToSocket(socket, user);
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

    socket.on('disconnect', async () => {
      console.log('A user disconnected', socket.data.user);
      await UserSocket.destroy({ where: { userId, socketId: socket.id } });
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
