import { Router } from 'express';
import { User } from '../database/model/user.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { generateReferralLink } from '../utils/referrals.js';

const router = Router();

router.get('/referrals', async (req, res) => {
  const userData = (req as any).user
  const userId = userData?.userId // Extract user ID from the verified token
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = await User.findByPk(userId, {
    include: [{ model: User, as: 'referrals' }],
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const referralLink = generateReferralLink(+userId)
  const referrals = user.referrals?.map(referral => ({
    username: referral.username,
    date: referral.createdAt,
  })) || [];

  return res.json({ referralLink: referralLink, referrals });
});

router.get('/leaderboard', getLeaderboard);

export default router;
