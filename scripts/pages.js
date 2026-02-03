import { getLatestGrades, getSubjectsWithGrade, getGradesFromSubject, getFruewarnungen, getFehlstunden } from './api.js';
import { logout } from './auth.js'
import { showToast, enableScroll, disableScroll, showLoading, hideLoading } from './ui.js';

const startPage = document.getElementById("startPage");
const notenPage = document.getElementById("notenPage");
const fruewarnungPage = document.getElementById("fruewarnungPage");
const fehlstundenPage = document.getElementById("fehlstundenPage");
const infoPage = document.getElementById("infoPage");

let pages = [startPage, notenPage, fruewarnungPage, fehlstundenPage, infoPage];

function hideAllPages() {
    document.getElementById("login").style.display = "none";
    for(let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    disableScroll();
}

function createGradeBox(data) {
    const box = document.createElement('div');
    box.classList.add('grade-box');
    if (data.Note !== null) {
        box.classList.add(`n${data.Note}`);
    }
    else {
        if (data.Punkte !== null && data.MaxPunkte !== null) {
            let percent = data.Punkte / data.MaxPunkte;

            if (percent >= 0.88) {
                box.classList.add(`n1`);
            }
            else if (percent >= 0.75) {
                box.classList.add(`n2`);
            }
            else if (percent >= 0.62) {
                box.classList.add(`n3`);
            }
            else if (percent >= 0.50) {
                box.classList.add(`n4`);
            }
            else {
                box.classList.add(`n5`);
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

async function createSubjectGradeBox(matrikelNr, token, subject) {
    const div = document.createElement("div");
    div.classList.add('subject-grades-list');
    div.innerHTML = `<h3 class="subject-grades-header">${subject}</h3>`;

    const response = await getGradesFromSubject(matrikelNr, token, subject);

    const data = await response.json();

    const gradeTable = document.createElement("table");

    gradeTable.style.minWidth = "100%";

    const headRow = document.createElement("tr");
    headRow.innerHTML = `
        <th>Datum</th>
        <th>Info</th>
        <th>Note</th>
        <th>Punkte</th>
        <th>Prozent</th>
    `;
    gradeTable.appendChild(headRow);

    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.Datum.replace("T00:00:00", "")}</td>
            <td>${item.Typ}</td>
            <td>${item.Note}</td>
            <td>${item.Punkte}/${item.MaxPunkte}</td>
            <td>${(item.Punkte/item.MaxPunkte*100).toFixed(2)}%</td>
        `;

        if (item.Note !== null) {
            row.classList.add(`n${item.Note}`);
        }
        else {
            if (item.Punkte !== null && item.MaxPunkte !== null) {
                let percent = item.Punkte / item.MaxPunkte;

                if (percent >= 0.88) {
                    row.classList.add(`n1`);
                }
                else if (percent >= 0.75) {
                    row.classList.add(`n2`);
                }
                else if (percent >= 0.62) {
                    row.classList.add(`n3`);
                }
                else if (percent >= 0.50) {
                    row.classList.add(`n4`);
                }
                else {
                    row.classList.add(`n5`);
                }
            }
        }

        gradeTable.appendChild(row);
    });

    div.appendChild(gradeTable);

    return div;
}

export async function showNotenPage(matrikelNr, token) {
    hideAllPages();
    notenPage.style.display = "block";
    document.getElementById("menu").close();
    enableScroll();

    const subjectList = document.getElementById("subjectList");
    const subjectGradeList = document.getElementById("subjectGradeList")

    subjectList.innerHTML = "";
    subjectGradeList.innerHTML = "";

    const response = await getSubjectsWithGrade(matrikelNr, token);
    if (!response.ok) {
        logout(true);
        return;
    }

    const data = await response.json();

    data.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${item.Fach}</p>`;
        subjectList.appendChild(div);
    });

    await showLoading();
    const promises = data.map(item =>
        createSubjectGradeBox(matrikelNr, token, item.Fach)
    );

    for (const promise of promises) {
        const box = await promise;
        subjectGradeList.appendChild(box);
    }
    await hideLoading();

}

export async function showFruehwarnungPage(matrikelNr, token) {
    hideAllPages();
    fruewarnungPage.style.display = "block";
    document.getElementById("menu").close();

    const fruewarnungList = document.getElementById("fruewarnungList");
    fruewarnungList.innerHTML = "";

    const response = await getFruewarnungen(matrikelNr, token);
    if (!response.ok) {
        logout(true);
        return;
    }

    const data = await response.json();

    if (data.length === 0) {
        const div = document.createElement("div");
        div.innerHTML = `<p>Keine Frühwarnungen vorhanden</p>`;
        fruewarnungList.appendChild(div);
        return;
    }

    data.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${item.Fach}</p>`;
        fruewarnungList.appendChild(div);
    });
}

export async function showFehlstundenPage(matrikelNr, token) {
    hideAllPages();
    fehlstundenPage.style.display = "block";
    document.getElementById("menu").close();

    const response = await getFehlstunden(matrikelNr, token);
    if (!response.ok) {
        logout(true);
        return;
    }

    const data = await response.json();

    const open = data.Fehlstunden_Offen;
    const notExcused = data.Fehlstunden_NichtEntschuldigt;
    const excused = data.Fehlstunden_Entschuldigt;
    const total = open + notExcused + excused;

    document.getElementById("absencesTotal").innerHTML = total;
    document.getElementById("absencesOpen").innerHTML = open
    document.getElementById("absencesExcused").innerHTML = excused;
    document.getElementById("absencesNotExcused").innerHTML = notExcused;
}

export function showInfoPage() {
    hideAllPages();
    infoPage.style.display = "block";
    document.getElementById("menu").close();
}