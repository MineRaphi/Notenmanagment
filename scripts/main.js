import { Preferences } from '@capacitor/preferences';
import { showLoading, hideLoading, showToast } from './ui.js';
import { getStudentInfo } from './api.js';
import { showStartPage, showInfoPage } from './pages.js';
import { doLogin } from './auth.js';

let accessToken = null;
let matrikelNr = null;

window.onload = () => {
    checkLoggedIn();
    document.getElementById("menu").disabled = true;

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const result = await doLogin(username, password);
        if (result) {
            accessToken = result.accessToken;
            matrikelNr = result.matrikelNr;
        }
    });
};

async function checkLoggedIn() {
    const { value: loadedToken } = await Preferences.get({ key: 'accessToken' });
    const { value: loadedMatrikel } = await Preferences.get({ key: 'matrikelNr' });

    if (!loadedToken || !loadedMatrikel) return;

    accessToken = loadedToken;
    matrikelNr = loadedMatrikel;

    showLoading();
    const response = await getStudentInfo(matrikelNr, accessToken);
    hideLoading();

    if (!response.ok) {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'matrikelNr' });
        return;
    }

    showToast("Login successful!");
    showStartPage(matrikelNr, accessToken);
}

window.showStartPage = () => showStartPage(matrikelNr, accessToken);
window.showInfoPage = showInfoPage;