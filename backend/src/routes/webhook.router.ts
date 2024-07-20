import { Request, Response, Router } from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';
import { StarService } from '../services/StarService.js';

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
    if (message) {
      console.log('Received message:', message);
    }
    const { successful_payment } = message
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