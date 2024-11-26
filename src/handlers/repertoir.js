import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import aleksandrnka from '../services/aleksandinskyService.js';
import dbService from '../services/dbService.js';

const wrap = (btn, index, currentRow) => currentRow.length >= index / 1;

export default async ctx => {
  try {
    const [theaterName, pageNum] = ctx.match.slice(1);

    let repertoir = await aleksandrnka.getRepertoir(pageNum);

    const markup = Markup.inlineKeyboard(
      repertoir.map(it => 
        Markup.button.callback(it.name, `show_info::aleksandrinka::${it.numId}`)
      ).concat(
        [
            Markup.button.callback('Back', `theater_list`)
        ]
      ),
      { wrap: (xx, index, currentRow) => currentRow.length > 1 },
    );

    send(ctx, `<b>${theaterName}</b>`, { parse_mode: 'html', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};