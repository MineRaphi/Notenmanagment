import { showStartPage, showNotenPage, showInfoPage } from './pages.js';
import { doLogin, checkLoggedIn, logout } from './auth.js';

let accessToken = null;
let matrikelNr = null;

window.onload = init;

async function init() {
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
    checkLoggedIn();
}

window.showStartPage = () => showStartPage(matrikelNr, accessToken);
window.showNotenPage = () => showNotenPage(matrikelNr, accessToken);
window.logout = () => logout();
window.showInfoPage = showInfoPage;