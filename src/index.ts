// Local purposes
require('dotenv').config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { jwtMiddleWare } from './managers/jwtManager';
import { getUserCallback, loginCallback, registerCallback, resetPasswordCallback } from './callbacks/endpoints';

const app: Express = express();

//Enable CORS (Cross ORigin Site)
app.use(cors());
//Body parser JSON
app.use(express.json());
//URL encoded parser
app.use(express.urlencoded());

const port = process.env.PORT ?? 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('SelfieBE is alive!');
});

app.get('/users/:userid', jwtMiddleWare, getUserCallback);

app.post('/register', registerCallback);

app.post('/login', loginCallback);

app.patch('/reset-password', resetPasswordCallback);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
