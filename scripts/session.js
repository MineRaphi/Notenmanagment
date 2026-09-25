import { SecureStorage } from '@aparajita/capacitor-secure-storage';

class Session {
    #accessToken = null;
    #matrikelNr = null;

    get accessToken() {
        return this.#accessToken;
    }

    async setAccessToken(v) {
        this.#accessToken = v;
        await SecureStorage.set('accessToken', v);
    }

    get matrikelNr() {
        return this.#matrikelNr
    }

    async setMatrikelNr(v) {
        this.#matrikelNr = v
        await SecureStorage.set('matrikelNr', v);
    }

    async load() {
        this.#accessToken = await SecureStorage.get('accessToken');
        this.#matrikelNr = await SecureStorage.get('matrikelNr');
    }

    async clear() {
        this.#accessToken = null;
        this.#matrikelNr = null;
        await SecureStorage.remove('accessToken');
        await SecureStorage.remove('matrikelNr');
    }
}

export const session = new Session();
