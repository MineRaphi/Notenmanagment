import { showStartPage, showNotenPage, showInfoPage, showFruehwarnungPage, showFehlstundenPage } from './pages.js';
import { doLogin, checkLoggedIn, logout } from './auth.js';
import { disableScroll } from './ui.js';

let accessToken = null;
let matrikelNr = null;

window.onload = init;

async function init() {
    document.getElementById("menu").disabled = true;
    disableScroll();

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
    const response = await checkLoggedIn();
    accessToken = response.accessToken;
    matrikelNr = response.matrikelNr;
}

document.getElementById("showStart").onclick = () => showStartPage(matrikelNr, accessToken);
document.getElementById("showNoten").onclick = () => showNotenPage(matrikelNr, accessToken);
document.getElementById("showFruewarnung").onclick = () => showFruehwarnungPage(matrikelNr, accessToken);
document.getElementById("showFehlstunden").onclick = () => showFehlstundenPage(matrikelNr, accessToken);
document.getElementById("showInfo").onclick = () => showInfoPage();
document.getElementById("logout").onclick = () => logout();