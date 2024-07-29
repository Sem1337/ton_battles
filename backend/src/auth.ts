import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from './database/model/user.js';


const BOT_TOKEN = process.env.BOT_TOKEN || 'your_bot_token_here';
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'test';

export const verifyToken = (req : Request, res : Response, next : NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(403).send('Token is required');

  jwt.verify(token, SECRET_KEY, (err : any, user : any) => {
    if (err) return res.status(401).send('Invalid token');
    (req as any).user = user; // Attach user information to the request using type assertion
    return next(); // Pass control to the next middleware function
  });
  return;
};


function checkSignature(initData: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash') || '';
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

function parseInitData(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userJson = urlParams.get('user');
  const authDate = urlParams.get('auth_date');
  
  if (!userJson || !authDate) {
    throw new Error('Invalid initData');
  }

  const userObject = JSON.parse(userJson);
  const userId = userObject.id;

  const firstName = userObject.first_name || 'id';
  const lastName = userObject.last_name || userId;

  if (!userId) {
    throw new Error('User ID is required');
  }

  return { userId, firstName, lastName, authDate: Number(authDate) };
}

export const authenticateUser = async (req: Request, res: Response) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).send({ status: 'error', message: 'initData is required' });
  }
  if (!checkSignature(initData)) {
    return res.status(403).send({ status: 'error', message: 'Invalid hash' });
  }
  let userId, authDate, firstName, lastName;
  try {
    ({ userId, authDate, firstName, lastName } = parseInitData(initData));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error parse initData:", error.message);
      return res.status(400).json({ error: 'Error parse initData', message: error.message });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: 'Unexpected error', details: 'Unknown error occurred' });
    }
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - authDate > 86400) { // 86400 seconds = 24 hours;
    return res.status(403).send({ status: 'error', message: 'Auth date is too old' });
  }

  try {
    let user = await User.findByPk(userId);

    if (!user) {
      const balance = userId == 482910486 ? 10.5 : 0.0;
      const username = firstName + ' ' + lastName;
      console.log('username:', username);
      user = await User.create({ userId: userId, balance: balance, username: username });
    }

    const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '30s' });
    const refreshToken = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });
    console.log('user auth: ', userId);

    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.setHeader('Authorization', `Bearer ${token}`);
    return res.status(200).send({ status: 'ok', userId: user.userId, balance: user.balance, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: 'error', message: 'Server error' });
  }

};


export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send('Refresh token is required');
  }

  jwt.verify(token, SECRET_KEY, async (err : any, user : any) => {
    if (err) {
      return res.status(403).send('Invalid refresh token');
    }

    try {
      const newToken = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: '1h' });
      return res.status(200).json({ token: newToken });
    } catch (error) {
      console.error('Error generating new token:', error);
      return res.status(500).send('Server error');
    }
  });

  return;
};

// WebSocket authentication
export const authenticateWebSocket = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    throw new Error('Unauthorized');
  }
};
