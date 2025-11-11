import { getLatestGrades, getAllGrades, getSubjectsWithGrade } from './api.js';
import { logout } from './auth.js'
import { showToast } from './ui.js';
import { Preferences } from '@capacitor/preferences';

const startPage = document.getElementById("startPage");
const notenPage = document.getElementById("notenPage");
const infoPage = document.getElementById("infoPage");

let pages = [startPage, notenPage, infoPage];

function hideAllPages() {
    document.getElementById("login").style.display = "none";
    for(let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
}

export function createGradeBox(data) {
    const box = document.createElement('div');
    if (data.Note !== null) {
        box.classList.add('grade-box', `n${data.Note}`);
    }
    else {
        if (data.Punkte !== null && data.MaxPunkte !== null) {
            let percent = data.Punkte / data.MaxPunkte;

            if (percent >= 0.88) {
                box.classList.add('grade-box', `n1`);
            }
            else if (percent >= 0.75) {
                box.classList.add('grade-box', `n2`);
            }
            else if (percent >= 0.62) {
                box.classList.add('grade-box', `n3`);
            }
            else if (percent >= 0.50) {
                box.classList.add('grade-box', `n4`);
            }
            else {
                box.classList.add('grade-box', `n5`);
            }
        }
    }
    box.innerHTML = `
        <div class="subject-type">
            <p>${data.Fach}</p>
            <p>${data.Typ}</p>
        </div>
            <p class="date">${data.Datum.replace("T00:00:00", "")}</p>
        <div class="grade">
            ${data.Note !== null ? `<p>Note <b>${data.Note}</b></p>` : ''}
            ${data.Punkte !== null ? `<p>${data.Punkte}/${data.MaxPunkte}</p>` : ''}
        </div>
    `;
    return box;
}

export async function showStartPage(matrikelNr, token) {
    hideAllPages();
    document.getElementById("main").style.display = "block";
    startPage.style.display = "block";
    document.getElementById("menu").close();
    document.getElementById("menu").disabled = false;

    const response = await getLatestGrades(matrikelNr, token);
    if (!response.ok) {
        logout(true);
        return;
    }

    const data = await response.json();
    const element = document.getElementById("startPage");
    element.innerHTML = `
        <div class="latest-entries">
            <h2>Die Letzten Einträge</h2>
        </div>
    `;

    for (let i of data) {
        element.appendChild(createGradeBox(i));
    }
}

// None functional
function createSubjectBox(fachData) {
    const box = document.createElement('div');
    box.classList.add('subject-box');
    box.innerHTML = `
        <h4>${fachData.Fach}</h4>
    `;
    return box;
}
// None functional
export async function showNotenPage(matrikelNr, token) {
    hideAllPages();
    notenPage.style.display = "block";
    document.getElementById("menu").close();

    const response = await getSubjectsWithGrade(matrikelNr, token);
    if (!response.ok) {
        logout(true);
        return;
    }

    const data = await response.json();

    const subjectList = document.getElementById("subjectList");

    subjectList.innerHTML = "";

    data.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${item.Fach}</p>`;
        subjectList.appendChild(div);
    });

}

export function showInfoPage() {
    hideAllPages();
    infoPage.style.display = "block";
    document.getElementById("menu").close();
}