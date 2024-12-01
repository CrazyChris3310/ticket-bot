import pool from './config.js';

class DbService {

    subscriptions = []

    async findSubscriptions(chat_id, showId) {
        if (!showId) {
            // return this.subscriptions.filter(subscription => subscription.chat_id === chat_id);
            return this.#doSelect('select * from subscriptions where chat_id = $1', [chat_id])
        }
        return this.#doSelect('select * from subscriptions where chat_id = $1 and showId = $2', [chat_id, showId]);
        // return this.subscriptions.filter(subscription => subscription.chat_id === chat_id && subscription.showId === showId);
    }

    async #doSelect(query, params) {
        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async addSubscription(subscription) {
        // this.subscriptions.push(subscription);
        try {
            const result = await pool.query("insert into subscriptions (showname, theatername, showid, url, chat_id) values ($1, $2, $3, $4, $5)", [subscription.showName, subscription.theaterName, subscription.showId, subscription.url, subscription.chat_id]);
            // return result.rows;
        } catch (err) {
            console.error(err);
            // return null;
        }
    }

    async removeSubscription(id) {
        // this.subscriptions = this.subscriptions.filter(subscription => subscription.id !== id);
        try {
            const result = await pool.query("delete from subscriptions where id = $1", [id]);
            // return result.rows;
        } catch (err) {
            console.error(err);
            // return null;
        }
    }
}

export default new DbService();