import { Request, Response } from 'express';
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || 'your_bot_token_here';


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

export const authenticateUser = (req: Request, res: Response) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).send({ status: 'error', message: 'initData is required' });
  }
  if (checkSignature(initData)) {
    const urlParams = new URLSearchParams(initData);
    const authDate = Number(urlParams.get('auth_date'));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if auth_date is within acceptable time range (e.g., 1 hour)
    if (currentTime - authDate <= 600) {
      return res.send({ status: 'ok', initData: Object.fromEntries(urlParams) });
    } else {
      return res.send({ status: 'error', message: 'Outdated data' });
    }
  } else {
    return res.send({ status: 'error', message: 'Invalid hash' });
  }
};
