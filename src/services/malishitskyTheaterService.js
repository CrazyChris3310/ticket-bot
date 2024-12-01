import TheaterService from "./theaterService.js";
import { JSDOM } from 'jsdom';
import { memoizeWithExpiration, Pageable } from "../util/index.js";

class AleksandrinskyService extends TheaterService {

    name = 'Камерный Театр Малышицкого';
    fullName = 'Камерный Театр Малышицкого';

    tag = 'malishitsky';

    baseUrl = 'https://www.vmtheatre.ru';
    repertoirUrl = this.baseUrl + '/productions';
    showsInfoUrl = this.baseUrl + '/afisha';
    PAGE_SIZE = 5;

    tcUrl = 'https://ticketscloud.com/v1/services/widget'

    showsCache = {}

    repertoir = memoizeWithExpiration(this.#fetchRepertoir.bind(this), 10, 'minute');

    async getRepertoir(pageNum) {
        return this.repertoir();
    }

    async #fetchRepertoir() {
        let body = await this.doGet(this.showsInfoUrl);
        let afisha = this.parseAfisha(body);
        let newShows = {}
        let counter = 0
        for (let perf of afisha) {
            if (newShows[perf.showId] == null) {
                let newShow = { numId: counter++, name: perf.name, showId: perf.showId, url: perf.link, performances: memoizeWithExpiration(() => this.#definePerformances(afisha, perf.showId), 10, 'minute') };
                newShows[perf.showId] = newShow
            }
        }
        return Object.values(newShows);
    }

    async #definePerformances(afisha, currentId) {
        let showPerformances = afisha.filter(it => it.showId == currentId)
        for (let x of showPerformances) {
            let detailedPerfInfo = await this.doPost(this.tcUrl, { 'Authorization': `token ${x.token}` }, { event: x.tcEvent })
            // let detailedPerfInfo = await this.xxx(this.tcUrl, { 'Authorization': `token ${x.token}` }, JSON.stringify({ event: x.tcEvent }))

            if (detailedPerfInfo == null) {
                x.ticketsAvailable = false;
            } else {
                x.ticketsAvailable = true;
            }
        }
        return showPerformances
    }

    async doPost(url, headers, body) {
        return fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        }).then(response => {
            if (response.status == 400 ) {
                throw new Error("Bad response from server");
            }
            return response
        }).then(response => response.text())
        .then(text => {console.warn(text); return JSON.parse(text)})
        .catch(error => console.error(error));
    }

    parseAfisha(body) {
        let performanceNodes = body.querySelectorAll('[data-tilda-page-alias="afisha"] > [data-record-type="396"]')
        return Array.from(performanceNodes).slice(0, performanceNodes.length-1).map(this.buildPerformance.bind(this));
    }

    buildPerformance(show) {
        let day = this.#extractElement(show, 'div[data-elem-id=\"1598176986635\"] div')
        if (!day) {
            console.error("Cannot read day info")
            return null;
        }
        let month = show.querySelector('div[data-elem-id=\"1598561530517\"] div').innerHTML
        let time = show.querySelector('div[data-elem-id=\"1598177186457\"] div').innerHTML
        let name = show.querySelector('div[data-elem-id=\"1598177384769\"] div a').innerHTML
        let link = show.querySelector('div[data-elem-id=\"1598177384769\"] div a').href
        let weekDay = show.querySelector('div[data-elem-id=\"1598561922387\"] div').innerHTML
        let tcUrl = show.querySelectorAll('div a')[1].href;
        let tcInfo = this.#extractTcInfo(tcUrl)

        return {
            name: name,
            showId: name,
            date: day + ' ' + month,
            weekDay: weekDay,
            time: time,
            link: link,
            token: tcInfo.token,
            tcEvent: tcInfo.event
        }
    }

    #extractTcInfo(url) {
        let paramsString = url.match("#ticketscloud:(.*)")[1]
        let pairs = paramsString.split('&')
        let params = pairs.map(it => it.split('='))
        return {
            event: params.find(it => it[0] === 'event')[1],
            token: params.find(it => it[0] === 'token')[1],
        }
        // #ticketscloud:event=67065a5de36b5ede0d80a9ce&token=eyJhbGciOiJIUzI1NiIsImlzcyI6InRpY2tldHNjbG91ZC5ydSIsInR5cCI6IkpXVCJ9.eyJwIjoiNWY3YjdlNWY4MjZhYTY5OWVlMzFhMWExIn0.JGNwuhfiO7uWzZBAOqCHWducEGtdLA8uiEUhiDPqcDM&lang=ru
    }

    #extractElement(node, selector) {
        let spanElement = node.querySelector(selector + ' span')
        if (spanElement == null || spanElement.innerHTML == null || spanElement.innerHTML === "") {
            let x = node.querySelector(selector)
            return x != null ? x.innerHTML : null
        } else {
            return spanElement.innerHTML
        }
    }

    async getShowInfo(numId) {
        return (await this.repertoir())[numId]
    }

}


let aleksandrnka = new AleksandrinskyService();
export default aleksandrnka;
