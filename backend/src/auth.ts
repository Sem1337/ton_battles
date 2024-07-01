import { Request, Response } from 'express';
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || 'your_bot_token_here';

export const authenticateUser = (req: Request, res: Response) => {
  const authData = req.body;
  const checkString = Object.keys(authData)
    .filter(key => key !== 'hash')
    .map(key => `${key}=${authData[key]}`)
    .sort()
    .join('\n');

  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  if (hash === authData.hash) {
    res.send({ status: 'ok', authData });
  } else {
    res.send({ status: 'error', message: 'Invalid hash' });
  }
};
