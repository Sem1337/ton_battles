import { Request, Response } from 'express';
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || 'your_bot_token_here';

export const authenticateUser = (req: Request, res: Response) => {
  const { authData } = req.body;

  if (!authData) {
    return res.status(400).send({ status: 'error', message: 'authData is required' });
  }

  const urlParams = new URLSearchParams(authData);
  const hash = urlParams.get('hash') || '';
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hash === hmac) {
    const urlParams = new URLSearchParams(authData);
    const authDate = Number(urlParams.get('auth_date'));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if auth_date is within acceptable time range (e.g., 1 hour)
    if (currentTime - authDate <= 3600) {
      return res.send({ status: 'ok', authData: Object.fromEntries(urlParams) });
    } else {
      return res.send({ status: 'error', message: 'Outdated data' });
    }
  } else {
    return res.send({ status: 'error', message: `Invalid hash: 1)${dataCheckString}\n 2)${hash}\n 3)${hmac}\n 4)${authData}\n 5)${urlParams}\n 6)${req.body}` });
  }
};
