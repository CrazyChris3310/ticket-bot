import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import dbService from '../services/dbService.js';
import subscriptions from './subscriptions.js';
import theaters from '../services/index.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default async ctx => {
    const [theaterTag, showId, perfNumid] = ctx.match.slice(1);

    let theater = theaters.find(it => it.tag === theaterTag);

    let showInfo = await theater.getShowInfoByNumId(showId);

    let subType = null
    let perf = {}
    if (perfNumid != null) {
      subType = 'PERFORMANCE';
      let perfs = await showInfo.performances();
      perf = perfs[perfNumid]
    } else {
      subType = 'SHOW';
    }

    let subs = await dbService.findSubscriptions(ctx.chat.id, showInfo, perf.idx);
    if (subs.length === 0) {
        await dbService.addSubscription({showName: showInfo.name, theaterName: theater.name, showId: showInfo.showId, url: showInfo.url, chat_id: ctx.chat.id, theater_tag: theaterTag, type: subType, perf_idx: perf.idx, date: perf.date });
    }

  try {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Отписаться', `toggle_sub::${theaterTag}::${showInfo.numId}::1`),
        Markup.button.callback('Назад', `start`),
      ],
      { wrap },
    );
    send(ctx, await buildMessage(ctx.chat.id), { parse_mode: 'markdown', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};

async function buildMessage(chat_id) {
    let message = '**Subscriptions**\n'
    let subs = await dbService.findSubscriptions(chat_id)
    subs.forEach(it => message += `[${it.showname} - ${it.theatername}](${it.url})\n`)
    return message;
}
