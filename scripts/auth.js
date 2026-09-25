import { Preferences } from '@capacitor/preferences';
import { showLoading, hideLoading, showToast } from './ui.js';
import { loginRequest, getStudentInfo } from './api.js';
import { showStartPage } from './pages.js';
import { session } from './session.js';
import { TIMEOUT_MESSAGE } from './config.js';

function timeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
    );
    return Promise.race([promise, timeout]);
}

export async function doLogin(username, password) {
    await showLoading();

    try {
        const response = await timeout(loginRequest(username, password), 5000)
        const data = response.data;

        if (response.status < 200 || response.status >= 300 || data.role !== "Schueler") {
            await hideLoading();
            showToast("Login failed!", false, 'center');
        }
        else {
            await session.setAccessToken(data.access_token);
            await session.setMatrikelNr(data.matrikelNr);

            await getStudentInfo(session.matrikelNr, session.accessToken);
            await hideLoading();
            showToast("Login successful!");
            showStartPage();
        }
    }
    catch (error) {
        await hideLoading();
        showToast("Server not reachable", false, 'center');
    }
}

export async function checkLoggedIn() {
    await session.load();

    showLoading();
    let response;
    try {
        response = await timeout(getStudentInfo(session.matrikelNr, session.accessToken), 5000);
    } catch (error) {
        hideLoading()
        showToast("Server not reachable", false, 'center')
        await session.clear()
        return;
    }
    hideLoading();

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        await session.clear()
        return;
    }

    showToast("Login successful!");
    showStartPage();
}

export async function logout(forced = false) {
    session.clear()

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
