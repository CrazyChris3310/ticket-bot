import { JSDOM } from 'jsdom';

export default class TheaterService {

    async getRepertoir() {

    }

    async getShowInfoByNumId(numId) {}

    async getShowInfoByShowId(showId) {
        let shows = await this.getRepertoir();
        return shows.find(show => show.showId === showId);
    }

    async doGet(url) {
        try {
            let response = await fetch(url);
            let text = await response.text();
            return new JSDOM(text).window.document;
        } catch (error) {
            console.error(error);
            return { isError: true, error: error }
        }
    }
    
}