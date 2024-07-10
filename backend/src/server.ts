import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from './routes/user.router.js';
import gameRoomRouter from './routes/gameRoom.router.js';
import balanceRouter from './routes/balance.router.js';
import cookieParser from 'cookie-parser';
import sequelize from './database/db.js';
import { authenticateUser, authenticateWebSocket, verifyToken } from './auth.js';
import { createServer } from 'http';
import { RawData, WebSocketServer } from 'ws';
import { GameRoomService } from './services/GameRoomService.js';
import User from './database/model/user.js';

const app = express();
const port = process.env.PORT || 8080;


app.use(cors({
  origin: 'https://sem1337.github.io', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser()); // Ensure cookie-parser middleware is used

app.use((req, res, next) => {
  if (req.path === '/auth') {
    return next(); // Skip verifyToken middleware for /auth
  }
  return verifyToken(req, res, next); // Apply verifyToken middleware for all other routes
});

app.use(userRouter);
app.use(gameRoomRouter);
app.use(balanceRouter);

app.post('/auth', authenticateUser);

app.get('/', (_req, res) => {
  res.send('Hello world');
});
//app.get('/', () => {console.log('Hello world !')});


sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync({ force: true }); // Set to true to drop and re-create tables during development
  })
  .then(() => {
    console.log('Database synced successfully.');
    // Create HTTP server
    const server = createServer(app);

    // Setup WebSocket server
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
      const token = req.url?.split('token=')[1]; // Extract token from query string
      console.log('received connection, token: ', token);
      if (!token) {
        console.log('no token');
        ws.close(4001, 'Unauthorized');
        return;
      }

      try {
        const decoded = authenticateWebSocket(token);
        (ws as any).user = decoded; // Attach decoded token data to WebSocket
      } catch (err) {
        console.log('error decoding token');
        ws.close(4001, 'Unauthorized');
        return;
      }

      // Handle incoming messages from the client WebSocket
      ws.on('message', async (message: RawData) => {
        const messageString = message.toString(); // Convert RawData to string
        const data = JSON.parse(messageString);

        try {
          switch (data.type) {
            case 'MAKE_BET': {
              const { betSize, roomId } = data;
              if (roomId) {
                const gameRoom = await GameRoomService.makeBet(roomId, (ws as any).user.userId, betSize);
                ws.send(JSON.stringify({ type: 'BET_MADE', players: gameRoom.players }));
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'User not in a room' }));
              }
              break;
            }
            case 'LEAVE_ROOM': {
              const { roomId } = data;
              if (roomId) {
                await GameRoomService.leaveGameRoom(roomId, (ws as any).user.userId);
                ws.send(JSON.stringify({ type: 'LEFT_ROOM' }));
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'User not in a room' }));
              }
              break;
            }
            case 'GET_BALANCE': {
              const user = await User.findByPk((ws as any).user.userId);
              console.log('getting balance')
              if (user) {
                console.log(user.userId)
                console.log(user.balance)
                ws.send(JSON.stringify({ type: 'BALANCE_UPDATE', balance: user.balance }));
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'User not found' }));
              }
              break;
            }
            default:
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type' }));
          }
        } catch (error) {
          if (error instanceof Error) {
            ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
          } else {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown error' }));
          }
        }
      });
      console.log('sending CONNECTED to ', (ws as any).user.userId);
      ws.send(JSON.stringify({ type: 'CONNECTED' }));
    });
    // Start the server (both HTTP and WebSocket)
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database or sync:', error, sequelize.config.host);
  });