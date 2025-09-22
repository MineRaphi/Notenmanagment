import { Preferences } from '@capacitor/preferences';
import { showLoading, hideLoading, showToast } from './ui.js';
import { loginRequest, getStudentInfo } from './api.js';
import { showStartPage, showInfoPage } from './pages.js';

let accessToken = null;
let matrikelNr = null;

window.onload = () => {
    checkLoggedIn();
    document.getElementById("menu").disabled = true;

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        await doLogin(username, password);
    });
};

async function doLogin(username, password) {
    await showLoading();
    const response = await loginRequest(username, password);
    const data = await response.json();

    if (response.ok && data.role !== "Lehrer") {
        accessToken = data.access_token;
        matrikelNr = data.matrikelNr;

        await Preferences.set({ key: 'accessToken', value: accessToken });
        await Preferences.set({ key: 'matrikelNr', value: matrikelNr });

        await getStudentInfo(matrikelNr, accessToken);
        await hideLoading();
        showToast("Login successful!");
        showStartPage(matrikelNr, accessToken);
    } else {
        await hideLoading();
        showToast("Login failed!", false);
    }
}

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