import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { StatusBar, Style } from '@capacitor/status-bar';
import { loadingController, menuController } from '@ionic/core';


const URL = `https://notenmanagement.htl-braunau.at/rest`;
let accessToken = null;
let matrikelNr = null;
let className = null;
let role = null;
let firstName = null;
let lastName = null;

let loadingInstance = null;


// Function to show the loading spinner
export async function showLoading() {
    loadingInstance = await loadingController.create({
        message: 'Loading...',
        spinner: 'crescent',
        translucent: true,
        backdropDismiss: false,
    });
    await loadingInstance.present();
}

// Function to hide the loading spinner
export async function hideLoading() {
    if (loadingInstance) {
        await loadingInstance.dismiss();
        loadingInstance = null; // clear reference
    }
}

window.onload = function load() {
    checkLoggedIn();
}

// requesting push notification
// currently disabled because of android
// PushNotifications.requestPermissions().then(result => {
//   if (result.receive === 'granted') {
//     PushNotifications.register();
//   }
// });


// login for notenmanagement
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent form from submitting the default way (page reload)

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    loginRequest(username, password);
});

async function loginRequest(username, password) {
    await showLoading();
    const response = await fetch(URL + '/Token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=password&username=${username}&password=${password}`
    })

    const data = await response.json();
    
    if(response.ok) {
        if(data.role === "Lehrer") {
            alert("Lehrer Login über notenmanagement.htl-braunau.at")
            await hideLoading();
            return;
        }

        accessToken = data.access_token;
        matrikelNr = data.matrikelNr;

        await Preferences.set({
            key: 'accessToken',
            value: accessToken,
        });
    
        await Preferences.set({
            key: 'matrikelNr',
            value: matrikelNr,
        });

        await getInfo();
        await hideLoading();
        Toast.show({
            text: '✅ Login successful!',
            duration: 'short',
            position: 'bottom',
        });
        showStartPage();
    }
    else {
        await hideLoading();
        Toast.show({
            text: '❌ Login failed!',
            duration: 'short',
            position: 'center',
        });
    }
}

async function getInfo() {
    const response = await fetch(URL + `/api/Schueler/${matrikelNr}`, {
        method: 'GET',
        headers: {
            'Authorization': `bearer ${accessToken}`,
        }
    })

    //const data = response.json();
    if (!response.ok) {
        accessToken = null;
        matrikelNr = null;
        return;
    }

    const data = await response.json();

    className = data.Klasse;
    firstName = data.Vorname;
    lastName = data.Nachname;
}

async function checkLoggedIn() {
    const { value: loadedToken } = await Preferences.get({ key: 'accessToken' });
    const { value: loadedMatrikel } = await Preferences.get({ key: 'matrikelNr' });

    if (loadedToken === null || loadedMatrikel === null) {
        return;
    }

    accessToken = loadedToken;
    matrikelNr = loadedMatrikel;

    showLoading();

    const response = await fetch(URL + `/api/Schueler/${matrikelNr}`, {
        method: 'GET',
        headers: {
            'Authorization': `bearer ${accessToken}`,
        }
    })

    hideLoading();

    //const data = response.json();
    if (!response.ok) {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'matrikelNr' });

        accessToken = null;
        matrikelNr = null;
        return;
    }

    const data = await response.json();

    className = data.Klasse;
    firstName = data.Vorname;
    lastName = data.Nachname;

    Toast.show({
        text: '✅ Login successful!',
        duration: 'short',
        position: 'bottom',
        keyboardAvoid: true,
    });

    showStartPage();
}

async function showStartPage() {
    document.getElementById("login").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("startPage").style.display = "block";
    document.getElementById("infoPage").style.display = "none";
    document.getElementById("menu").close();

    const response = await fetch(URL + `/api/Schueler/${matrikelNr}/Noten?limit=5&sort=-Datum`, {
        method: 'GET',
        headers: {
            'Authorization': `bearer ${accessToken}`,
        }
    })

    if (!response.ok) {
        return -1;
    }
    const data = await response.json();
    const element = document.getElementById("startPage")
    element.innerHTML = `
        <button id="logout">Logout</button>
        <div class="latest-entries">
            <h2>Die Letzten Einträge</h2>
        </div>
    `;
    document.getElementById("logout").addEventListener("click", async () => {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'matrikelNr' });

        document.getElementById("login").style.display = "block";
        document.getElementById("main").style.display = "none";

        Toast.show({
            text: '✅ Logged out!',
            duration: 'short',
            position: 'bottom',
            keyboardAvoid: true,
        });
    });



    for(let i=0; i<data.length; i++) {
        const box = createGradeBox(data[i]);
        element.appendChild(box);
    }
}

async function showInfoPage() {
    document.getElementById("startPage").style.display = "none";
    document.getElementById("infoPage").style.display = "block";
    document.getElementById("menu").close();
}

function createGradeBox(data) {
    const box = document.createElement('div');
    box.classList.add('grade-box');
    box.classList.add(`n${data.Note}`);

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
    `
    return box;
}

window.showStartPage = showStartPage;
window.showInfoPage = showInfoPage;

