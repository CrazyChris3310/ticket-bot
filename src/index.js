import 'dotenv/config.js';
import { Telegraf } from 'telegraf';
import startHandler from './handlers/start.js'
import repertoirHandler from './handlers/repertoir.js';
import subscriptionsHandler from './handlers/subscriptions.js';
import theatersHandler from './handlers/theaters.js';
import showInfoHandler from './handlers/showInfo.js';
import toggleSubHandler from './handlers/toggleSub.js';
import NotificationJob from './jobs/NotificationJob.js';


const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.start(startHandler);
bot.action('start', startHandler);
bot.action(/^repertoir(?:::(\w+))(?:::(\d+))*$/, repertoirHandler);
bot.action('subscriptions', subscriptionsHandler);
bot.action('theater_list', theatersHandler);
bot.action(/^show_info(?:::(\w+))(?:::(\d+))$/, showInfoHandler);
bot.action(/^toggle_sub(?:::(\w+))(?:::(\d+))(?:::(\d+))$/, toggleSubHandler);

bot.launch();

let job = new NotificationJob(bot);
job.start(10);

// const url = 'https://spb.ticketland.ru/teatry/bdt-imtovstonogova/tri-tolstyaka-epizod-2-zheleznoe-serdce/?tldebug=false&lite-layout=1&iframe-hash=344d24e8c1b2e648376f37bbf3c3056f&callback_url=&order_password=&cashback_value=0&authed=false&is_mobile=false&mode=-1';
// const options = {
//   method: 'GET',
//   headers: {
//     Cookie: 'spid=1729248943203_424ead584bc2bd11d91f2210e847b731_ebho0pk0mmbi5wsg; spsc=1733071823552_7d5cdb24178561a2c37d733957446c2c_e6cfb3ea8f0a0fa28cc6ebefdcae8ea5;',
//     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 YaBrowser/24.10.0.0 Safari/537.36'
//   }
// };

// try {
//   const response = await fetch(url, options);
//   const data = await response.text();
//   console.log(data);
// } catch (error) {
//   console.error(error);
// }