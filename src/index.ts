require('dotenv').config();

import express, { Express, Request, Response } from 'express';
import { User, isValidUser } from './types/user';
import cors from 'cors';
import userManager from './managers/userManager';
import { jwtMiddleWare } from './managers/jwtManager';

const app: Express = express();

//Enable CORS (Cross ORigin Site)
app.use(cors());
//Body parser JSON
app.use(express.json());
//URL encoded parser
app.use(express.urlencoded());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('SelfieBE is alive!');
});

app.get('/users/:userid', jwtMiddleWare, async (req, res) => {
  if (!req.params.userid) {
    res.status(400).send({ error: 'provide userID' });
    return;
  }
  const user = await userManager.readUser(req.params.userid);
  if (user) {
    res.status(200).send(user);
    return;
  }
  res.status(404).send({ error: 'username not found' });
});

app.post('/register', async (req, res) => {
  const body = req.body as User;

  if (!isValidUser(body)) {
    res.status(400).send({ error: 'provide valid form' });
    return;
  }

  try {
    await userManager.insertUser(body);
    '[server]: New User ' + body.email + ' created';
    res.status(200).send('');
    return;
  } catch (e: any) {
    console.error(
      '[server]: User ' + body.email + " can't be created, already exists"
    );
    res.status(400).send({ error: 'user already exists' });
  }
});

app.post('/login', async (req, res) => {
  const body = req.body;
  if (!body.userID || !body.password) {
    res.status(400).send({ error: 'provide UserID and Password' });
    return;
  }

  const response = await userManager.login(body);
  if (!response) {
    res.status(404).send({ error: 'user not found' });
    return;
  }

  res.status(200).send(response);
});

app.patch('/reset-password', async (req, res) => {
  const body = req.body;
  if (!body.userID || !body.oldPassword || !body.newPassword) {
    res.status(400).send({ error: 'provide a valid form' });
    return;
  }

  const isUpdated = await userManager.resetPassword(req.body);
  if (!isUpdated) {
    res.status(404).send({ error: 'User not found' });
    return;
  }
  '[server]: User ' + body.userID + ' resetted his password';
  res.status(200).send('');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
