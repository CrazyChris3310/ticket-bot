import TheaterService from "./theaterService.js";
import { JSDOM } from 'jsdom';
import { memoizeWithExpiration, Pageable } from "../util/index.js";

class AleksandrinskyService extends TheaterService {

    baseUrl = 'https://alexandrinsky.ru';
    repertoirUrl = this.baseUrl + '/afisha-i-bilety/repertuar/';
    PAGE_SIZE = 5;

    repertoir = memoizeWithExpiration(this.#fetchRepertoir.bind(this), 10, 'second');

    async getRepertoir(pageNum) {
        return this.repertoir();
    }

    async #fetchRepertoir() {
        let response = await fetch(this.repertoirUrl);
        let text = await response.text();
        let body = new JSDOM(text).window.document;
        return this.parseRepertoir(body);
    }

    parseRepertoir(body) {
        let showNodes = body.querySelectorAll(".container-poster-tickets .box-poster-tickets");
        // console.log(Array.from(showNodes));
        return Array.from(showNodes).map(this.buildShow.bind(this));
    }

    buildShow(node) {
        let name = node.querySelector("h4 a").innerHTML;
        let specUrl = this.baseUrl + node.querySelector("h4 a").href ;
        return { name, url: specUrl };
    }

}


let aleksandrnka = new AleksandrinskyService();
export default aleksandrnka;