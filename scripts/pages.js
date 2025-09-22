import { getLatestGrades } from './api.js';
import { showToast } from './ui.js';
import { Preferences } from '@capacitor/preferences'; // needed for logout
import { Toast } from '@capacitor/toast';            // needed for logout

export function createGradeBox(data) {
    const box = document.createElement('div');
    box.classList.add('grade-box', `n${data.Note}`);
    box.innerHTML = `
        <div class="subject-type">
            <p>${data.Fach}</p>
            <p>${data.Typ}</p>
        </div>
            <p class="date">${data.Datum.replace("T00:00:00", "")}</p>
        <div class="grade">
            <p>Note <b>${data.Note}</b></p>
            ${data.Punkte !== null ? `<p>${data.Punkte}/${data.MaxPunkte}</p>` : ''}
        </div>
    `;
    return box;
}

export async function showStartPage(matrikelNr, token) {
    document.getElementById("login").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("startPage").style.display = "block";
    document.getElementById("infoPage").style.display = "none";
    document.getElementById("menu").close();
    document.getElementById("menu").disabled = false;

    const response = await getLatestGrades(matrikelNr, token);
    if (!response.ok) return;

    const data = await response.json();
    const element = document.getElementById("startPage");
    element.innerHTML = `
        <button id="logout">Logout</button>
        <div class="latest-entries">
            <h2>Die Letzten Einträge</h2>
        </div>
    `;

    element.querySelector('#logout').addEventListener('click', async () => {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'matrikelNr' });

        document.getElementById("login").style.display = "block";
        document.getElementById("main").style.display = "none";
        document.getElementById("menu").disabled = true;

        await Toast.show({
            text: '✅ Logged out!',
            duration: 'short',
            position: 'bottom',
            keyboardAvoid: true,
        });
    });

    for (let i of data) {
        element.appendChild(createGradeBox(i));
    }
}

export function showInfoPage() {
    document.getElementById("startPage").style.display = "none";
    document.getElementById("infoPage").style.display = "block";
    document.getElementById("menu").close();
}