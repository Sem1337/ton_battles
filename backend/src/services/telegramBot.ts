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
