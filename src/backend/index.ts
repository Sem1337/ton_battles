import express, { Request, Response } from 'express';

const app = express();
const port = 13337;


app.get('/', (_: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});