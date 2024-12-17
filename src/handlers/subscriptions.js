import { Markup } from 'telegraf';
import send from '../helpers/send.js';
import dbService from '../services/dbService.js';

const wrap = (btn, index, currentRow) => currentRow.length > 2;

export default async ctx => {

    try {
        const markup = Markup.inlineKeyboard(
          [
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
        let message = '**Подписки**\n'
        let subs = await dbService.findSubscriptions(chat_id)
        subs.forEach(it => message += buildLine(it))
        return message;
    }

    function buildLine(sub) {
      let result = `[${sub.showname} - ${sub.theatername}`
      if (sub.type === 'PERFORMANCE') {
        result += ` - ${sub.date}`
      }
      return result + `](${sub.url})\n`
    }
    