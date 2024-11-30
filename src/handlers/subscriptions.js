import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import dbService from '../services/dbService.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default async ctx => {
    const [theaterName, showId, perfId] = ctx.match.slice(1);
    try {
        const markup = Markup.inlineKeyboard(
          [
            Markup.button.callback('Отписаться', `toggle_sub::${theaterName}::${showId}::${perfId}`),
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
    