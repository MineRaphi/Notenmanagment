import { getLatestGrades, getSubjectsWithGrade, getGradesFromSubject, getFruewarnungen, getFehlstunden, getLFdata, getLFgrade } from './api.js';
import { logout } from './auth.js'
import { showToast, enableScroll, disableScroll, showLoading, hideLoading } from './ui.js';

const startPage = document.getElementById("startPage");
const notenPage = document.getElementById("notenPage");
const fruewarnungPage = document.getElementById("fruewarnungPage");
const fehlstundenPage = document.getElementById("fehlstundenPage");
const infoPage = document.getElementById("infoPage");
const LFdetailsPage = document.getElementById("LFdetailsPage");

let pages = [startPage, notenPage, fruewarnungPage, fehlstundenPage, infoPage, LFdetailsPage];

function hideAllPages() {
    document.getElementById("login").style.display = "none";
    for(let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    disableScroll();
}

function createGradeBox(matrikelNr, token, data) {
    const box = document.createElement('div');
    box.classList.add('grade-box');
    box.addEventListener("click", () => {
        showLFdetailsPage(matrikelNr, token, data.LF_ID);
    });

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

    const date = data.Datum.replace("T00:00:00", "");
    const year = date.substring(0, 4);
    const month = date.substring(5,7);
    const day = date.substring(8,10);
    
    box.innerHTML = `
        <div class="subject-type">
            <p>${data.Fach}</p>
            <p>${data.Typ}</p>
        </div>
            <p class="date">${day}/${month}/${year}</p>
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
        element.appendChild(createGradeBox(matrikelNr, token, i));
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
    gradeTable.style.marginTop = "0px";

    const headRow = document.createElement("tr");
    headRow.style.backgroundColor = "#F7DEB6";
    headRow.style.height = "35px";

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
        row.style.height = "45px";
        row.addEventListener("click", () => {
            showLFdetailsPage(matrikelNr, token, item.LF_ID);
        });

        const date = item.Datum.replace("T00:00:00", "");
        const year = date.substring(2, 4);
        const month = date.substring(5,7);
        const day = date.substring(8,10);
        const type = item.Typ.replace("Semesternote", "Semester");
        let grade = item.Note;
        let points = `${item.Punkte}/${item.MaxPunkte}`;
        let percent = `${(item.Punkte/item.MaxPunkte*100).toFixed(2)}%`;
        let gradeSpan = 1;

        if (grade === null) {
            grade = "";
        }
        if (item.Punkte === null || item.MaxPunkte === null) {
            points = "";
            percent = "";
        }
        if (grade === 0) {
            gradeSpan = 2;
            grade = "Gefehlt";
        }

        row.innerHTML = `
            <td style="width: 19%; text-align: end;">${day}/${month}/${year}</td>
            <td style="width: 27%; text-align: center;">${type}</td>
            <td style="width: 15%; text-align: center;" colspan=${gradeSpan}>${grade}</td>
            <td style="width: 20%; text-align: center;">${points}</td>
            <td style="width: 19%; text-align: end;">${percent} </td>
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

export async function showLFdetailsPage(matrikelNr, token, LF_ID) {
    hideAllPages();
    LFdetailsPage.style.display = "block";
    document.getElementById("menu").close();

    const LFheaderName = document.getElementById("LFheaderName");
    const LFheaderDetails = document.getElementById("LFheaderDetails");
    const LFgrade = document.getElementById("LFgrade");
    const LFpoints = document.getElementById("LFpoints");
    const LFpercent = document.getElementById("LFpercent");
    const LFcomment = document.getElementById("LFcomment");

    LFheaderName.textContent = "";
    LFheaderDetails.textContent = "";
    LFgrade.textContent = "";
    LFpoints.textContent = "";
    LFpercent.textContent = "";
    LFcomment.textContent = "";

    await showLoading();

    const dataResponse = await getLFdata(matrikelNr, token, LF_ID);
    const data = await dataResponse.json();

    const gradeResponse = await getLFgrade(matrikelNr, token, LF_ID);
    const grade = await gradeResponse.json();

    const date = data.Datum.replace("T00:00:00", "");
    const year = date.substring(0, 4);
    const month = date.substring(5,7);
    const day = date.substring(8,10);

    let note = grade.Note;
    let points = `${grade.Punkte}/${data.MaxPunkte}`;
    let percent = `${(grade.Punkte/data.MaxPunkte*100).toFixed(2)}%`;

    if (note === null) {
        note = "";
    }
    if (grade.Punkte === null || data.MaxPunkte === null) {
        points = "";
        percent = "";
    }
    if (note === 0) {
        note = "Gefehlt";
    }

    LFheaderName.textContent = `${data.Typ} in ${data.Fach}`;
    LFheaderDetails.textContent = `${day}/${month}/${year}, ${data.Kommentar}`;

    LFgrade.innerHTML = note;
    LFpoints.innerHTML = points;
    LFpercent.innerHTML = percent;
    LFcomment.innerHTML = grade.Kommentar;

    const row = document.getElementById("LFtableData");
    row.classList.remove("n0", "n1", "n2", "n3", "n4", "n5");

    if (grade.Note !== null) {
        row.classList.add(`n${grade.Note}`);
    }
    else {
        if (grade.Punkte !== null && data.MaxPunkte !== null) {
            let percent = grade.Punkte / data.MaxPunkte;

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

    await hideLoading();
}