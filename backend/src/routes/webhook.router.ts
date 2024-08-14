import { Request, Response, Router } from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';
import { StarService } from '../services/StarService.js';
import { User } from '../database/model/user.js';
import { updateUserGems, updateUserPoints } from '../services/balanceService.js';
import Big from 'big.js';

export const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Middleware to log every request
bot.use((ctx, next) => {
  console.log('Received update:', ctx.update);
  return next();
});


bot.start((ctx) => ctx.reply('Welcome! Use /buy to purchase points.'));

// Handle pre-checkout queries
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.createWebhook({ domain: `${process.env.BACKEND_DOMAIN}`, path: '/webhook' });

const router = Router();
const jsonParser = bodyParser.json();

const handleStart = async (startPayload: string, message: any) => {
  let referredBy: number | null = null;
  const chatId = message.chat.id;
  const username = message.from.first_name + ' ' + message.from.last_name;
  if (startPayload) {
    try {
      referredBy = +startPayload;
      await User.findOrCreate({
        where: {
          userId: message.from.id,
        },
        defaults: {
          username,
          referredBy,
          points: '0',
        }
      });
      console.log('assigned refferal');
      await updateUserPoints(referredBy, new Big(15000));
      await updateUserGems(referredBy, new Big(10));
    } catch (error) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Invalid referral link or user already registered.',
      };
    }
  }
  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: `Welcome ${username}!`,
  };
}

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
      payload: `{userId:${userId}}`, // Using userId as payload
      currency: 'XTR',
      provider_token: '',
      prices: [{ label: 'Points', amount: 1 }], // 100 points for $1
    };
    const invres = await bot.telegram.createInvoiceLink(invoice);

    return res.status(200).json({ success: true, invoiceURL: invres });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.json({ success: false });
  }
});

router.post('/webhook', jsonParser, async (req: Request, res: Response) => {
  const { update_id, message, pre_checkout_query } = req.body;
  console.log('Received update with ID:', update_id);
  try {
    if (pre_checkout_query) {
      console.log(pre_checkout_query.id);
      const checkoutResponse = await bot.telegram.answerPreCheckoutQuery(pre_checkout_query.id, true);
      return checkoutResponse;

    }
    if (!message || !message.text) {
      return res.sendStatus(200);
    }
    if (message) {
      console.log('Received message:', message);
    }
    const { successful_payment, entities, text } = message
    if (entities && entities[0].type === 'bot_command') {
      if (text.startsWith('/start')) {
        const startPayload = text.split(' ')[1]; // This contains the referral token
        if (startPayload === '123') return res.status(200).send();
        const result = await handleStart(startPayload, message);
        return res.json(result).send();
      }
    }

    if (!successful_payment || !successful_payment.invoice_payload) {
      console.log('not successful_payment or payload');
      return res.status(400).send('Not successful payment');
    }

    await StarService.handlePurchase(successful_payment);
    return res.status(200).send();
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.sendStatus(500).send();
  }
});



export default router;