import { JSDOM } from 'jsdom';

export default class TheaterService {

    getRepertoir() {

    }

    getPerformanceInfo(id) {

    }

    async doGet(url) {
        let response = await fetch(url);
        let text = await response.text();
        return new JSDOM(text).window.document;
    }
    
}