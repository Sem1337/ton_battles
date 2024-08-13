import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from './routes/user.router.js';
import gameRoomRouter from './routes/gameRoom.router.js';
import balanceRouter from './routes/balance.router.js';
import webhookRouter from './routes/webhook.router.js';
import shopRouter from './routes/shop.router.js';
import taskRouter from './routes/task.router.js';
import cookieParser from 'cookie-parser';
import sequelize from './database/db.js';
import { authenticateUser, refreshToken, verifyToken } from './auth.js';
import { createServer } from 'http';
import { initializeSocket } from './utils/socket.js';
import ShopService from './services/ShopService.js';
import TaskService from './services/TaskService.js';
import { Game, GameRoom, Player } from './database/model/gameRoom.js';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
  origin: ['https://sem1337.github.io', 'https://www.tonbattles.ru', '*'], // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser()); // Ensure cookie-parser middleware is used

app.use((req, res, next) => {
  if (req.path === '/auth' || req.path === '/webhook' || req.path === '/refresh') {
    return next(); // Skip verifyToken middleware for /auth
  }
  return verifyToken(req, res, next); // Apply verifyToken middleware for all other routes
});

app.use(userRouter);
app.use(gameRoomRouter);
app.use(balanceRouter);
app.use(webhookRouter);
app.use(shopRouter);
app.use(taskRouter);

app.post('/auth', authenticateUser);
app.post('/refresh', refreshToken);

app.get('/', (_req, res) => {
  res.send('Hello world');
});


sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync({ force: false }); // Set to true to drop and re-create tables during development
  })
  .then(() => {
    console.log('seeding shop');
    return ShopService.seedShopItems();
  })
  .then(() => {
    console.log('seeding tasks');
    return TaskService.seedTasks();    
  })
  .then(() => {
    return Player.destroy({ truncate: true, cascade: true });
  })
  .then(() => {
    return Game.destroy({ truncate: true, cascade: true });
  })
  .then(() => {
    return GameRoom.destroy({ truncate: true, cascade: true });
  })
  .then(() => {
    console.log('Database synced successfully.');
    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    // Start the server (both HTTP and WebSocket)
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database or sync:', error, sequelize.config.host);
  });