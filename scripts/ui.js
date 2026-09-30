import { loadingController } from '@ionic/core';
import { Toast } from '@capacitor/toast';
import { LOADING_SPINNER_TIMEOUT_MS } from './config';
const ionContent = document.querySelector('ion-content');

let loadingPromise = null;
let loadingCount = 0;
let safetyTimer = null;

export function showLoading() {
    loadingCount++;
    if (!loadingPromise) {
        loadingPromise = loadingController
            .create({ message: 'Loading...', spinner: 'crescent', translucent: true, backdropDismiss: false })
            .then(async (l) => { await l.present(); return l; });

        safetyTimer = setTimeout(async () => {
            console.warn('Loading spinner force-dismissed after timeout — a hideLoading() call was likely missed.');
            loadingCount = 0;
            const p = loadingPromise;
            loadingPromise = null;
            safetyTimer = null;
            if (p) await (await p).dismiss();
        }, LOADING_SPINNER_TIMEOUT_MS);
    }
    return loadingPromise;
}

export async function hideLoading() {
    loadingCount = Math.max(0, loadingCount - 1);

    if (loadingCount > 0 || !loadingPromise) {
        return;
    }

    const p = loadingPromise;

    loadingPromise = null;

    await (await p).dismiss();
}

export async function showToast(message, success = true, position = 'bottom') {
    await Toast.show({
        text: `${success ? '✅' : '❌'} ${message}`,
        duration: 'short',
        position: position,
        keyboardAvoid: true,
    });
}

export function enableScroll() {
    ionContent.style.overflowY = 'auto';
}

export function disableScroll() {
    ionContent.style.overflowY = 'hidden';
}

export async function changeTheme(theme) {
    if (theme == "dark") {
        document.documentElement.classList.add("dark");
        document.getElementById("themeToggle").checked = true;
    }
    else if (theme == "light") {
        document.documentElement.classList.remove("dark");
    }
    else {
        document.documentElement.classList.toggle("dark");
    }
}