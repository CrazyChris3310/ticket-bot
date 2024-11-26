
export function memoizeWithExpiration(fn, expiration, timeUnit) {
    let currentValue = null
    return function() {
        if (currentValue != null) {
            return currentValue;
        }
        currentValue = fn();
        setTimeout(() => {
            currentValue = null;
        }, toMilliseconds(expiration, timeUnit));
        return currentValue;
    }
}

function toMilliseconds(time, timeUnit) {
    switch (timeUnit) {
        case 'second':
            return time * 1000;
        case 'minute':
            return time * 60 * 1000;
    }
}

export class Pageable {
    constructor(page, pageSize, elements) {
        this.page = page;
        this.pageSize = pageSize;
        this.total = elements.length
        this.elements = elements.slice((page - 1) * pageSize, page * pageSize);
    }

    get totalPages() {
        return Math.ceil(this.total / this.pageSize);
    }

    get isFirst() {
        return this.page === 1;
    }

    get isLast() {
        return this.page === this.totalPages;
    }

}