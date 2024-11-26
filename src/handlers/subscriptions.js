import { Markup } from 'telegraf';
import send from '../helpers/send.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default ctx => {
  try {
    const markup = Markup.inlineKeyboard(
      [ 
        Markup.button.callback('Меню', `start`),
        Markup.button.callback('Отменить', `cancel_subscription`),
      ],
      { wrap },
    );
    send(ctx, '<b>Subscriptions</b>\nЕкатерина и Вольтер 20.09 Вт 14:00', { parse_mode: 'html', reply_markup: markup.reply_markup });
  } catch (err) {
    console.error(err);
  }
};
