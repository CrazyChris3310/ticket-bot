import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import dbService from '../services/dbService.js';
import subscriptions from './subscriptions.js';
import theaters from '../services/index.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default async ctx => {
    const [theaterTag, showId, perfId] = ctx.match.slice(1);

    let theater = theaters.find(it => it.tag === theaterTag);

    let showInfo = await theater.getShowInfo(showId);
    if (dbService.findSubscriptions(ctx.chat.id, showInfo.showId).length === 0) {
        dbService.addSubscription({name: showInfo.name, theater: theater.name, showId: showInfo.showId, url: showInfo.url, chat_id: ctx.chat.id});
    } else {
        dbService.removeSubscription(ctx.chat.id, showInfo.showId);
    }

  try {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Отписаться', `toggle_sub::${theaterTag}::${showInfo.numId}::1`),
        Markup.button.callback('Назад', `start`),
      ],
      { wrap },
    );
    send(ctx, buildMessage(ctx.chat.id), { parse_mode: 'markdown', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};

function buildMessage(chat_id) {
    let message = '**Subscriptions**\n'
    dbService.findSubscriptions(chat_id).forEach(it => message += `[${it.name} - ${it.theater}](${it.url})\n`)
    return message;
}
