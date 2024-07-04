import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from './database/model/user.js';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || 'your_bot_token_here';
const SECRET_KEY = process.env.JWT_SECRET_KEY || '';


export const verifyToken = (req : Request, res : Response, next : NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).send('Token is required');

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

  if (!userId) {
    throw new Error('User ID is required');
  }

  return { userId, authDate: Number(authDate) };
}

export const authenticateUser = async (req: Request, res: Response) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).send({ status: 'error', message: 'initData is required' });
  }
  if (!checkSignature(initData)) {
    return res.status(403).send({ status: 'error', message: 'Invalid hash' });
  }
  let userId, authDate;
  try {
    ({ userId, authDate } = parseInitData(initData));
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
  if (currentTime - authDate > 600) { // 86400 seconds = 24 hours; 600 seconds = 10 minutes
    return res.status(403).send({ status: 'error', message: 'Auth date is too old' });
  }

  try {
    let user = await User.findByPk(userId);

    if (!user) {
      user = await User.create({ userId: userId, balance: 0.0 });
    }

    const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '1h' });

    // Set JWT in HTTP-only cookie
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
    res.json({ success: true });

    return res.status(200).send({ status: 'ok', userId: user.userId, balance: user.balance });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: 'error', message: 'Server error' });
  }

};
