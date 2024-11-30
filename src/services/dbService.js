class DbService {

    subscriptions = []

    findSubscriptions(chat_id, showId) {
        if (!showId) {
            return this.subscriptions.filter(subscription => subscription.chat_id === chat_id);
        }
        return this.subscriptions.filter(subscription => subscription.chat_id === chat_id && subscription.showId === showId);
    }

    addSubscription(subscription) {
        this.subscriptions.push(subscription);
    }

    removeSubscription(id) {
        this.subscriptions = this.subscriptions.filter(subscription => subscription.id !== id);
    }
}

export default new DbService();