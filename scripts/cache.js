import { session } from "./session";
import { TIMEOUT_MESSAGE } from "./config";
import { logout } from "./auth";

const store = new Map(); // key -> { value, expires }

const cache = {
    get(key) {
        const entry = store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expires) {
            store.delete(key);
            return null;
        }
        return entry.value;
    },
    set(key, value, TTL_ms) {
        store.set(key, { value, expires: Date.now() + TTL_ms });
    },
    clear() {
        store.clear();
    }
};

export async function loadCached(key, fetchFunc, render, TTL_sec) {
    const user = session.matrikelNr;
    const cached = cache.get(key);

    if (cached) {
        render(cached);
    }

    const response = await fetchFunc();

    if (session.matrikelNr !== user) {
        return;
    }

    if (response.status === 0) {
        if (!cached) showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }
    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const fresh = response.data;
    if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
        cache.set(key, fresh, TTL_sec * 1000);
        render(fresh);
    }
}