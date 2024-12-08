import TheaterService from "./theaterService.js";
import { JSDOM } from 'jsdom';
import { memoizeWithExpiration, Pageable } from "../util/index.js";

class AleksandrinskyService extends TheaterService {

    name = 'Александринский театр';
    fullName = 'Александринский театр';

    tag = 'aleksandrinsky';

    baseUrl = 'https://alexandrinsky.ru';
    repertoirUrl = this.baseUrl + '/afisha-i-bilety/repertuar/';
    showInfoUrl = this.baseUrl + '/afisha-i-bilety/';
    PAGE_SIZE = 5;

    showsCache = {}

    repertoir = memoizeWithExpiration(this.#fetchRepertoir.bind(this), 10, 'minute');

    async getRepertoir(pageNum) {
        return this.repertoir();
    }

    async #fetchRepertoir() {
        let body = await this.doGet(this.repertoirUrl)
        if (body.isError) {
            return [];
        }
        let newShows= this.parseRepertoir(body);
        // newShows.forEach((show) => this.showsCache[show.numId] = memoizeWithExpiration(() => this.#fetchShowInfo(show.url)), 10, 'minute');
        return newShows;
    }

    parseRepertoir(body) {
        let showNodes = body.querySelectorAll(".container-poster-tickets .box-poster-tickets");
        // console.log(Array.from(showNodes));
        return Array.from(showNodes).map(this.buildShow.bind(this));
    }

    buildShow(node, idx) {
        let name = node.querySelector("h4 a").innerHTML;
        let relLink = node.querySelector("h4 a").href;
        let showId = relLink.match("afisha-i-bilety/(\\w+)/*")[1]
        let specUrl = this.baseUrl + relLink;
        return { numId: idx, name, showId, url: specUrl, performances: memoizeWithExpiration(() => this.#fetchShowInfo(specUrl), 10, 'minute') };
    }
    
    async getShowInfoByNumId(numId) {
        // return this.showsCache[numId]();
        return (await this.repertoir())[numId]
    }

    async #fetchShowInfo(showUrl) {
        let body = await this.doGet(showUrl);
        if (body.isError) {
            return [];
        }
        return this.parseShow(body);
    }

    parseShow(body) {
        let performanceNodes = body.querySelectorAll("div.box-events div.box-events-list_group");
        return Array.from(performanceNodes).map(this.buildPerformance.bind(this));
    }

    buildPerformance(show) {
        let date = show.querySelector(".box-events-list_group-date").innerHTML
        let weekDay = show.querySelector(".box-events-list_group-date-1").innerHTML
        let time = show.querySelector(".box-broadcasts_time span").innerHTML
        let buyTicketText = show.querySelector(".box-link.btn-choose-location a").innerHTML
    
        return {
            date: date,
            weekDay: weekDay,
            time: time,
            ticketsAvailable: buyTicketText.includes("Купить билет")
        }
    }

}


let aleksandrnka = new AleksandrinskyService();
export default aleksandrnka;