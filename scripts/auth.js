import { Preferences } from '@capacitor/preferences';
import { showLoading, hideLoading, showToast } from './ui.js';
import { loginRequest, getStudentInfo } from './api.js';
import { showStartPage } from './pages.js';

const URL = `https://notenmanagement.htl-braunau.at/rest`;

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


