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

    document.getElementById("showStart").addEventListener("click", () => showStartPage(matrikelNr, accessToken));
    document.getElementById("showNoten").addEventListener("click", () => showNotenPage(matrikelNr, accessToken));
    document.getElementById("showFruewarnung").addEventListener("click", () => showFruehwarnungPage(matrikelNr, accessToken));
    document.getElementById("showFehlstunden").addEventListener("click", () => showFehlstundenPage(matrikelNr, accessToken));
    document.getElementById("showWhereIsMyTeacherPage").addEventListener("click", () => showWhereIsMyTeacherPage(matrikelNr, accessToken));
    document.getElementById("whereIsMyTeacherButton").addEventListener("click", () => whereIsMyTeacherShowData());
    document.getElementById("showSettings").addEventListener("click", () => showSettingsPage());
    document.getElementById("showInfo").addEventListener("click", () => showInfoPage());
    document.getElementById("logout").addEventListener("click", () => logout())

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