import { Preferences } from '@capacitor/preferences';
import { showLoading, hideLoading, showToast } from './ui.js';
import { loginRequest, getStudentInfo } from './api.js';
import { showStartPage } from './pages.js';

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
        const data = await response.json();

        if (response.ok && data.role !== "Lehrer") {
            await Preferences.set({ key: 'accessToken', value: data.access_token });
            await Preferences.set({ key: 'matrikelNr', value: data.matrikelNr });

            await getStudentInfo(data.matrikelNr, data.access_token);
            await hideLoading();
            showToast("Login successful!");
            showStartPage(data.matrikelNr, data.access_token);

            return { accessToken: data.access_token, matrikelNr: data.matrikelNr};
        }
        else {
            await hideLoading();
            showToast("Login failed!", false, 'center');
        }
    }
    catch (error) {
        await hideLoading();
        showToast("Server not reachable", false, 'center');
    }
}

export async function checkLoggedIn() {
    const { value: loadedToken } = await Preferences.get({ key: 'accessToken' });
    const { value: loadedMatrikel } = await Preferences.get({ key: 'matrikelNr' });

    if (!loadedToken || !loadedMatrikel) return;

    showLoading();
    const response = await timeout(getStudentInfo(loadedMatrikel, loadedToken), 5000);
    hideLoading();

    if (!response.ok) {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'matrikelNr' });
        return;
    }

    showToast("Login successful!");
    showStartPage(loadedMatrikel, loadedToken);

    return { matrikelNr: loadedMatrikel, accessToken: loadedToken };
}

export async function logout(forced = false) {
    await Preferences.remove({ key: 'accessToken' });
    await Preferences.remove({ key: 'matrikelNr' });

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
