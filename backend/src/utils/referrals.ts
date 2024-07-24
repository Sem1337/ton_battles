import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;

export const generateReferralLink = (userId: number): string => {
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '30d' });
  return `https://t.me/ton_battles_bot?start=${token}`;
};