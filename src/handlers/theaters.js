import { Markup } from 'telegraf';
import send from '../helpers/send.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default ctx => {
  try {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Александринский', `repertoir::aleksandrinka`),
        Markup.button.callback('Меню', `start`)
      ],
      { wrap },
    );
    send(ctx, '<b>Theaters</b>', { parse_mode: 'html', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};
