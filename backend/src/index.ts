import express, { Request, Response } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from './routes/user.router.js';
import gameRoomRouter from './routes/gameRoom.router.js';
import sequelize from './database/db.js';

const app = express();
const port = 13337;

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.use(cors());
app.use(bodyParser.json());

app.use(userRouter);
app.use(gameRoomRouter);

app.get('/', (_: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});