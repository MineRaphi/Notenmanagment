class Session {
    #accessToken = null;
    #matrikelNr = null;

    get accessToken() {
        return this.#accessToken;
    }

    set accessToken(v) {
        this.#accessToken = v
    }

    get matrikelNr() {
        return this.#matrikelNr
    }

    set matrikelNr(v) {
        this.#matrikelNr = v
    }
}

export const session = new Session();
