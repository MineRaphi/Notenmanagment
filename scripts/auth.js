import { showLoading, hideLoading, showToast } from './ui.js';
import { loginRequest, getStudentInfo } from './api.js';
import { clearPages, showStartPage } from './pages.js';
import { session } from './session.js';
import { TIMEOUT_MESSAGE } from './config.js';
import { cache } from './cache.js';

export async function doLogin(username, password) {
    await showLoading();

    const response = await loginRequest(username, password);
    const data = response.data;

    if (response.status === 0) {
        await hideLoading();
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300 || data.role !== "Schueler") {
        await hideLoading();
        showToast("Login failed!", false, 'center');
    }
    else {
        await session.setAccessToken(data.access_token);
        await session.setMatrikelNr(data.matrikelNr);

        await hideLoading();
        showToast("Login successful!");
        showStartPage();
    }
}

export async function checkLoggedIn() {
    await session.load();

    if (!session.matrikelNr || !session.accessToken) {
        return;
    }

    await showLoading();
    let response;
    response = await getStudentInfo(session.matrikelNr, session.accessToken);

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        await hideLoading();
        await session.clear()
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        await session.clear()
        showToast("new login required", false, 'bottom');
        await hideLoading();
        return;
    }

    await hideLoading();
    showToast("Login successful!");
    showStartPage();
}

export async function logout(forced = false) {
    await session.clear()
    clearPages();
    cache.clear()

    document.getElementById("login").style.display = "block";
    document.getElementById("main").style.display = "none";
    document.getElementById("menu").disabled = true;
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    if (!forced) {
        showToast("Logged out!", true);
    }
    else {
        showToast("Neuanmeldung erforderlich!", false);
    }
}
