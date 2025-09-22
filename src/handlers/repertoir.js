import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import theaters from '../services/index.js'

const wrap = (btn, index, currentRow) => currentRow.length >= index / 1;

export default async ctx => {
  try {
    const [theaterTag, pageNum] = ctx.match.slice(1);

    let theater = theaters.find(it => it.tag === theaterTag)

    let repertoir = await theater.getRepertoir(pageNum);

    const markup = Markup.inlineKeyboard(
      repertoir.map(it => 
        Markup.button.callback(it.name, `show::${theater.tag}::${it.numId}`)
      ).concat(
        [
            Markup.button.callback('Back', `theaters`)
        ]
      ),
      { wrap: (xx, index, currentRow) => currentRow.length > 1 },
    );

    send(ctx, `<b>${theater.fullName}</b>`, { parse_mode: 'html', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};