import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import theaters from '../services/index.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default async ctx => {
    const [theaterName, numId] = ctx.match.slice(1);

    let theater = theaters.find(theater => theater.tag === theaterName);

    let showInfo = await theater.getShowInfoByNumId(numId);
    let perfs = await showInfo.performances();

  try {
    const markup = Markup.inlineKeyboard(
        perfs.map((info, idex) => Markup.button.callback(info.date + ' ' + info.weekDay + ' ' + info.time, `toggle_sub::${theaterName}::${numId}::${idex}`))
        .concat(
            [Markup.button.callback('Подписаться', `toggle_sub::${theaterName}::${numId}`)],
            [Markup.button.callback('Back', `repertoir::${theaterName}`)]
        ),
      { wrap: (xx, idx, array) => true}
    );
    send(ctx, buildMessage(showInfo, perfs), { parse_mode: 'markdown', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};

function buildMessage(showInfo, perfs) {
    let result = `[${showInfo.name}](${showInfo.url})\n`;
    if (perfs.length === 0) {
        result += 'Спектаклей не запланировано';
    }
    for (let performanceInfo of perfs) {
        result += performanceInfo.date + ' ' + performanceInfo.weekDay + ' ' + performanceInfo.time + ' ' + (performanceInfo.ticketsAvailable ? '[v]' : '[x]') + '\n';
    }
    return result;
}