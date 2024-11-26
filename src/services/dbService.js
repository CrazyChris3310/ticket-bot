class DbService {

    subscriptions = []

    findSubscriptions(chat_id) {
        return this.subscriptions.filter(subscription => subscription.chat_id === chat_id);
    }

    addSubscription(subscription) {
        this.subscriptions.push(subscription);
    }

    removeSubscription(id) {
        this.subscriptions = this.subscriptions.filter(subscription => subscription.id !== id);
    }
}

export default new DbService();