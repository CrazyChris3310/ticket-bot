import 'dotenv/config.js';
import { Telegraf } from 'telegraf';
import startHandler from './handlers/start.js'
import repertoirHandler from './handlers/repertoir.js';
import subscriptionsHandler from './handlers/subscriptions.js';
import theatersHandler from './handlers/theaters.js';


const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.start(startHandler);
bot.action('start', startHandler);
bot.action(/^repertoir(?:::(\w+))(?:::(\d+))*$/, repertoirHandler);
bot.action('subscriptions', subscriptionsHandler);
bot.action('theater_list', theatersHandler);
bot.hears('привет', ctx => ctx.reply('Привет!'));

bot.launch();
