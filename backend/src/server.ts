import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from './routes/user.router.js';
import gameRoomRouter from './routes/gameRoom.router.js';
import sequelize from './database/db.js';
import { authenticateUser } from './auth.js';

const app = express();
const port = 13337;


app.use(cors({
    origin: 'https://sem1337.github.io', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}));

app.use(bodyParser.json());

app.use(userRouter);
app.use(gameRoomRouter);

app.post('/auth', authenticateUser);

app.get('/', (_req, res) => {
    res.send('Hello world');
  });
//app.get('/', () => {console.log('Hello world !')});


sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync({ force: false }); // Set to true to drop and re-create tables during development
    })
    .then(() => {
        console.log('Database synced successfully.');
        // Start the server
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database or sync:', error, sequelize.config.host);
    });