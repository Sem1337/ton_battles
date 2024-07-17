import { Request, Response, Router } from 'express';
import { updateUserPoints } from '../services/balanceService.js'; // Adjust import path as needed
import Big from 'big.js';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Middleware to log every request
bot.use((ctx, next) => {
  console.log('Received update:', ctx.update);
  return next();
});


bot.start((ctx) => ctx.reply('Welcome! Use /buy to purchase points.'));

bot.command('buy', (ctx) => {
  const invoice = {
    title: 'Buy Points',
    description: 'Purchase points to use in the game',
    payload: `${ctx.from.id}`, // Using userId as payload
    currency: 'XTR',
    prices: [{ label: 'Points', amount: 100 * 100 }], // 100 points for $1
    provider_token: '',
  };

  return ctx.replyWithInvoice(invoice);
});

// Handle pre-checkout queries
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.launch();

const router = Router();
const jsonParser = bodyParser.json();


router.get('/buy_points', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user?.userId; // Extract user ID from the verified token
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    // Create an invoice and send it to the user
    const invoice = {
      title: 'Buy Points',
      description: 'Purchase points to use in the game',
      payload: `${userId}`, // Using userId as payload
      currency: 'XTR',
      provider_token: '',
      prices: [{ label: 'Points', amount: 100 * 100 }], // 100 points for $1
    };
    await bot.telegram.sendInvoice(userId,invoice);
    res.json({ success: true });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.json({ success: false });
  }
});

router.post('/webhook', jsonParser, async (req: Request, res: Response) => {
  const { update_id, message, invoice } = req.body;
  // Log the update_id for tracking
  console.log('Received update with ID:', update_id);

  // Process the message if it exists
  if (message) {
    console.log('Received message:', message);
    // Here you could handle different types of messages, e.g., text, commands

  }
  // Validate the incoming request (add your own validation logic)
  if (!invoice || !invoice.payload) {
    return res.status(400).send('Invalid request');
  }

  try {
    const userId = invoice.payload; // Assuming payload contains userId
    const points = calculatePoints(invoice.total_amount); // Define how to calculate points from the amount

    console.log(`Successful payment of ${invoice.total_amount} from user ${userId}`);

    // Update user's points in your database
    await updateUserPoints(+userId, new Big(points).div(100)); // Assuming 1 USD = 100 points

    console.log('Webhook received:', req.body);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.sendStatus(500);
  }
});

const calculatePoints = (amount: string) => {
  // Example conversion: 1 point per 100 cents
  return new Big(amount).div(100);
};

export default router;