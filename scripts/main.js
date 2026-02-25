import { showStartPage, showNotenPage, showInfoPage, showFruehwarnungPage, showFehlstundenPage, showWhereIsMyTeacherPage, whereIsMyTeacherShowData, showSettingsPage } from './pages.js';
import { doLogin, checkLoggedIn, logout } from './auth.js';
import { changeTheme, disableScroll, showToast } from './ui.js';
import { loadTheme, setPreferedTheme } from './preferences.js';

let accessToken = null;
let matrikelNr = null;

window.onload = init;

async function init() {
    document.getElementById("menu").disabled = true;
    disableScroll();

    loadPreferedTheme();

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

async function loadPreferedTheme() {
        const { theme, lastSystemTheme } = await loadTheme();
    const isSystemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme != "dark" && theme != "light") {
        
        if (isSystemThemeDark) {
            changeTheme("dark");
            setPreferedTheme("dark");
        }
        else {
            setPreferedTheme("light");
        }
    }
    else {
        changeTheme(theme);
    }
    
    if (isSystemThemeDark) {
        if (lastSystemTheme != "dark") {
            changeTheme("dark");
            setPreferedTheme("dark");
        }
    }
    else {
        if (lastSystemTheme != "light") {
            changeTheme("light");
            setPreferedTheme("light");
        }
    }
}

document.getElementById("showStart").onclick = () => showStartPage(matrikelNr, accessToken);
document.getElementById("showNoten").onclick = () => showNotenPage(matrikelNr, accessToken);
document.getElementById("showFruewarnung").onclick = () => showFruehwarnungPage(matrikelNr, accessToken);
document.getElementById("showFehlstunden").onclick = () => showFehlstundenPage(matrikelNr, accessToken);
document.getElementById("showWhereIsMyTeacherPage").onclick = () => showWhereIsMyTeacherPage(); 
document.getElementById("whereIsMyTeacherButton").onclick = () => whereIsMyTeacherShowData();
document.getElementById("showSettings").onclick = () => showSettingsPage();
document.getElementById("showInfo").onclick = () => showInfoPage();
document.getElementById("logout").onclick = () => logout();

document.getElementById("themeToggle").addEventListener("ionChange", () => {
    const toggleDark = document.getElementById("themeToggle").checked;
    let system;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        system = "dark";
    }
    else {
        system = "light";
    }

    if (toggleDark) {
        changeTheme("dark");
        setPreferedTheme("dark", system);
    }
    else {
        changeTheme("light");
        setPreferedTheme("light", system);
    }
});