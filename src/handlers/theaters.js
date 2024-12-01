import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import theaters from '../services/index.js';

export default ctx => {
  try {
    const markup = Markup.inlineKeyboard(
      theaters.map(theater => Markup.button.callback(theater.name, `repertoir::${theater.tag}`))
        .concat(Markup.button.callback('Меню', `start`)),
      { wrap: () => true },
    );
    send(ctx, '<b>Театры</b>', { parse_mode: 'html', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};
