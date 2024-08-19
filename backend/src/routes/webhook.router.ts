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


// Handle pre-checkout queries
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});


const handleCallbackQuery = async (callbackQuery: any) => {
  const callbackData = callbackQuery?.data;
  const chatId = callbackQuery?.message?.chat.id;
  if (callbackData === 'help') {
    console.log('successfully received help');
    await bot.telegram.answerCbQuery(callbackQuery.id);
    await bot.telegram.sendMessage(chatId, 'If you need help, please visit our support form: https://forms.gle/Hzit6evtEdXDRN5CA.');
  }
};

bot.createWebhook({ domain: `${process.env.BACKEND_DOMAIN}`, path: '/webhook'});

const router = Router();
const jsonParser = bodyParser.json();

const handleStart = async (startPayload: string, message: any) => {
  let referredBy: number | null = null;
  const chatId = message.chat.id;
  const username = (message.from.first_name || message.from.id) + ' ' + (message.from.last_name || '');
  if (startPayload) {
    try {
      referredBy = +startPayload;

      const user = await User.findByPk(message.from.id);
      if (!user) {
        await User.create({
          userId: message.from.id,
          username,
          referredBy,
          points: '0',
        })
        console.log('assigned refferal');
        await updateUserPoints(referredBy, new Big(50000));
        await updateUserGems(referredBy, new Big(10));
      } //else {
        //user.referredBy = referredBy;
        //await user.save();
      //}

    } catch (error) {
      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: 'Invalid referral link or user already registered.',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎮 Play game', url: 'https://t.me/ton_battles_bot?start' }], // Replace with your actual mini app link
            [{ text: '❓ Help', callback_data: 'help' }]
          ]
        }
      };
    }
  }
  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: `Welcome ${username}!`,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Play game', url: 'https://t.me/ton_battles_bot?start' }], // Replace with your actual mini app link
        [{ text: '❓ Help', callback_data: 'help' }]
      ]
    }
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
  const { update_id, message, pre_checkout_query, callback_query } = req.body;
  console.log('Received update with ID:', update_id);
  try {
    if (pre_checkout_query) {
      console.log(pre_checkout_query.id);
      const checkoutResponse = await bot.telegram.answerPreCheckoutQuery(pre_checkout_query.id, true);
      console.log('response: ', checkoutResponse);
      return res.status(200).send(checkoutResponse);
    }

    if (callback_query) {
      console.log('Received callback query:', callback_query);
      await handleCallbackQuery(callback_query);
      return res.sendStatus(200);
    }

    console.log('checking message', message);
    if (!message) {
      return res.sendStatus(200);
    }
    if (message) {
      console.log('Received message:', message);
    }
    const { successful_payment, entities, text } = message
    if (entities && entities[0].type === 'bot_command') {
      console.log('received bot command');
      if (text.startsWith('/start')) {
        const startPayload = text.split(' ')[1]; // This contains the referral token
        if (startPayload === '123') return res.status(200).send();
        const result = await handleStart(startPayload, message);
        return res.json(result).send();
      }
    }
    console.log('checking successful_payment');
    if (!successful_payment || !successful_payment.invoice_payload) {
      console.log('not successful_payment or payload');
      return res.status(200).send('ok');
    }
    console.log('handling purchase');
    await StarService.handlePurchase(successful_payment);

    console.log('success purchase');
    return res.status(200).send();
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.sendStatus(500).send();
  }
});



export default router;