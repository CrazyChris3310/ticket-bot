import dbService from "../services/dbService.js";
import theaterArray from "../services/index.js";

const theaters = new Map(
    theaterArray.map(obj => {
        return [obj.tag, obj];
    }),
);

class NotificationJob {

    constructor(bot) {
        this.bot = bot;
    }

    start(interval) {
        setInterval(this.execute.bind(this), interval * 60 * 1000);
    }

    async execute() {
        console.log("Check 2");
        let subs = await dbService.findSubscriptions();
        let notifications = [];
        for (let sub of subs) {
            let theater = theaters.get(sub.theater_tag)
            let showInfo = await theater.getShowInfoByShowId(sub.showid);
            let perfs = await showInfo.performances();
            if (sub.type === 'PERFORMANCE') {
                perfs = perfs.filter(perf => perf.idx === sub.perf_idx);
            }
            let showNotifications = {
                chat_id: sub.chat_id,
                theater: sub.theatername,
                showName: sub.showname,
                showUrl: sub.url,
                performances: []
            }
            let foundAvailable = false
            perfs.forEach(perf => {
                if (perf.ticketsAvailable) {
                    foundAvailable = true;
                    showNotifications.performances.push(perf);
                }
            });
            if (foundAvailable) {
                notifications.push(showNotifications);
            };
        };
        this.sendNotifications(notifications);
    }

    sendNotifications(notifications) {
        notifications.forEach(notification => {
            this.bot.telegram.sendMessage(notification.chat_id, this.buildMessage(notification), { parse_mode: 'markdown' })
        });
    }

    buildMessage(notification) {
        let message = `Появились места на [${notification.showName}](${notification.showUrl}) в ${notification.theater}\n`;
        for (let performanceInfo of notification.performances) {
            message += performanceInfo.date + ' ' + performanceInfo.weekDay + ' ' + performanceInfo.time + '\n';
        }
        return message;
    }

}

export default NotificationJob;