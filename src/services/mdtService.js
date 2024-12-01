import TheaterService from "./theaterService.js";
import { memoizeWithExpiration, Pageable } from "../util/index.js";

class MdtService extends TheaterService {

    name = 'МДТ';
    tag = 'mdt';

    baseUrl = 'https://mdt-dodin.ru';
    repertoirUrls = [
        this.baseUrl + '/plays/main/',
        this.baseUrl + '/plays/chamber/'
    ];
    
    ticketsAvailableUrl = 'https://mdtdodin.core.ubsystem.ru/uiapi/event/sale-status'

    PAGE_SIZE = 5;

    showsCache = {}

    repertoir = memoizeWithExpiration(this.#fetchRepertoir.bind(this), 10, 'minute');

    async getRepertoir(pageNum) {
        return this.repertoir();
    }

    async #fetchRepertoir() {
        let newShows = [];
        for (let x of this.repertoirUrls) {
            let response = await this.#fetchSingleRepertoir(x);
            newShows.push(...response)
        }
        return newShows;
    }

    async #fetchSingleRepertoir(url) {
        let body = await this.doGet(url);
        let newShows= this.parseRepertoir(body);
        return newShows;
    }

    parseRepertoir(body) {
        let showNodes = body.querySelectorAll("div.single_content div > div.play_item");
        // console.log(Array.from(showNodes));
        return Array.from(showNodes).map(this.buildShow.bind(this));
    }

    buildShow(node, idx) {
        let name = node.querySelector("span.title span").innerHTML;
        let relLink = node.querySelector("a").href;
        let showId = relLink.match("plays/(\\w+)/*")[1]
        let specUrl = this.baseUrl + relLink;
        return { numId: idx, name, showId, url: specUrl, performances: memoizeWithExpiration(() => this.#fetchShowInfo(specUrl), 10, 'minute') };
    }
    
    async getShowInfo(numId) {
        // return this.showsCache[numId]();
        return (await this.repertoir())[numId]
    }

    async #fetchShowInfo(showUrl) {
        return this.#fecthBasicShowInfo(showUrl);
    }

    async #fecthBasicShowInfo(showUrl) {
        let body = await this.doGet(showUrl);
        let performanceListRelLink = body.querySelector("div.all_date_link a").href
        body = await this.doGet(this.baseUrl + performanceListRelLink);
        return this.parseShow(body);
    }

    async parseShow(body) {
        let performanceNodes = body.querySelectorAll(".performance-afisha li ul.pack-list")
        let performances = Array.from(performanceNodes).map(this.buildPerformance.bind(this));
        let availability = await this.doPost(this.ticketsAvailableUrl, {ids: performances.map(p => p.internalId)})
        performances.forEach((p) => p.ticketsAvailable = availability[p.internalId].salesAvailable)
        return performances;
    }

    parseAvailablities(body) {
        body.querySelector("")
    }

    async doPost(url, body) {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return response.json();
    }

    buildPerformance(show) {
        let dateBlock = show.querySelector(".performance-afisha__date")
        let day = dateBlock.querySelector(".day").innerHTML
        let month = dateBlock.querySelector(".month").innerHTML
        let weekDay = dateBlock.querySelector(".weekday span").innerHTML
        let time = dateBlock.querySelector(".time").innerHTML
        let buyTicketBtn = show.querySelector("li a")
        let internalId = show.querySelector("li:last-child").dataset.hwmEventId
    
        return {
            internalId: internalId,
            date: day + " " + month,
            weekDay: weekDay,
            time: time,
            ticketsAvailable: !buyTicketBtn.classList.contains("disabled")
        }
    }

}


let mdtService = new MdtService();
export default mdtService;