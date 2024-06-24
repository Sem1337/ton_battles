import express, { Request, Response } from 'express';
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = 13337;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (_: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});