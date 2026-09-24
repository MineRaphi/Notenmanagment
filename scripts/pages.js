import { getLatestGrades, getSubjectsWithGrade, getGradesFromSubject, getFruewarnungen, getFehlstunden, getLFdata, getLFgrade, getLehrer, getLehrerListUntis, getLehrerDataUntis } from './api.js';
import { logout } from './auth.js'
import { showToast, enableScroll, disableScroll, showLoading, hideLoading } from './ui.js';
import Chart from 'chart.js/auto';
import { session } from './session.js';
import { TIMEOUT_MESSAGE } from './config.js';

const startPage = document.getElementById("startPage");
const notenPage = document.getElementById("notenPage");
const fruewarnungPage = document.getElementById("fruewarnungPage");
const fehlstundenPage = document.getElementById("fehlstundenPage");
const whereIsMyTeacherPage = document.getElementById("whereIsMyTeacherPage");
const settingsPage = document.getElementById("settingsPage");
const infoPage = document.getElementById("infoPage");
const subjectPage = document.getElementById("subjectPage");
const LFdetailsPage = document.getElementById("LFdetailsPage");

let chart = null;


let pages = [startPage, notenPage, fruewarnungPage, fehlstundenPage, whereIsMyTeacherPage, settingsPage, infoPage, subjectPage, LFdetailsPage];

function hideAllPages() {
    document.getElementById("login").style.display = "none";
    for(let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    disableScroll();
    if (chart !== null) {
        chart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        chart.update();
    }
}

function createGradeBox(data) {
    const box = document.createElement('div');
    box.classList.add('grade-box');
    box.addEventListener("click", () => {
        showLFdetailsPage(data.LF_ID);
    });

    box.classList.add(getGradeClass(data.Note, data.Punkte, data.MaxPunkte));

    const formatedDate = formatDate(data.Datum, false);
    
    if (data.Note !== 0) {
        box.innerHTML = `
            <div class="subject-type">
                <p>${data.Fach}</p>
                <p>${data.Typ}</p>
            </div>
                <p class="date">${formatedDate}</p>
            <div class="grade">
                ${data.Note !== null ? `<p>Note <b>${data.Note}</b></p>` : ''}
                ${data.Punkte !== null ? `<p>${data.Punkte}/${data.MaxPunkte}</p>` : ''}
            </div>
        `;
    }
    else {
        box.innerHTML = `
            <div class="subject-type">
                <p>${data.Fach}</p>
                <p>${data.Typ}</p>
            </div>
                <p class="date">${formatedDate}</p>
            <div class="grade">
                <p><b style="font-size: 15px;">Gefehlt</b></p>
                ${data.Punkte !== null ? `<p>${data.Punkte}/${data.MaxPunkte}</p>` : ''}
            </div>
        `;
    }

    return box;
}

function getGradeClass(note, punkte, maxPunkte) {
    if (note !== null) {
        return `n${note}`;
    }

    if (punkte !== null && maxPunkte !== null) {
        const percent = punkte / maxPunkte;
        if (percent >= 0.88) return 'n1';
        if (percent >= 0.75) return 'n2';
        if (percent >= 0.62) return 'n3';
        if (percent >= 0.50) return 'n4';
        return 'n5';
    }
    return 'nd';
}

function formatDate(data, shortYear=false) {
    const date = data.replace("T00:00:00", "");

    let year;
    if (shortYear) {
        year = date.substring(2, 4);
    } else {
        year = date.substring(0, 4);
    }
    const month = date.substring(5,7);
    const day = date.substring(8,10);

    return `${day}/${month}/${year}`
}

export async function showStartPage() {
    hideAllPages();
    document.getElementById("main").style.display = "block";
    startPage.style.display = "block";
    document.getElementById("menu").close();
    document.getElementById("menu").disabled = false;

    const response = await getLatestGrades(session.matrikelNr, session.accessToken);

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }
    
    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const data = response.data;
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

async function createSubjectGradeBox(subject) {
    const div = document.createElement("div");
    div.classList.add('subject-grades-list');
    div.innerHTML = `<h3 class="subject-grades-header">${subject}</h3>`;

    const response = await getGradesFromSubject(session.matrikelNr, session.accessToken, subject);

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const data = response.data;

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
            showLFdetailsPage(item.LF_ID);
        });

        const formatedDate = formatDate(item.Datum);

        const type = item.Typ.replace("Semesternote", "Semester");
        let grade = item.Note;
        let points = `${item.Punkte}/${item.MaxPunkte}`;
        let percent = `${(item.Punkte/item.MaxPunkte*100).toFixed(2)}%<span style="color: #00000000">.</span>`;
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
            <td style="width: 19%; text-align: end;">${formatedDate}</td>
            <td style="width: 27%; text-align: center;">${type}</td>
            <td style="width: 15%; text-align: center;" colspan=${gradeSpan}>${grade}</td>
            <td style="width: 20%; text-align: center;">${points}</td>
            <td style="width: 19%; text-align: end;">${percent} </td>
        `;

        row.classList.add(getGradeClass(item.Note, item.Punkte, item.MaxPunkte));

        gradeTable.appendChild(row);
    });

    div.appendChild(gradeTable);

    return div;
}

export async function showNotenPage() {
    hideAllPages();
    notenPage.style.display = "block";
    document.getElementById("menu").close();
    enableScroll();

    const subjectList = document.getElementById("subjectList");
    const subjectGradeList = document.getElementById("subjectGradeList")

    subjectList.innerHTML = "";
    subjectGradeList.innerHTML = "";

    const response = await getSubjectsWithGrade(session.matrikelNr, session.accessToken);

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const data = await response.data;

    data.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${item.Fach}</p>`;
        div.addEventListener("click", () => {
            showSubjectPage(item.Fach);
        });
        subjectList.appendChild(div);
    });

    await showLoading();
    const promises = data.map(item =>
        createSubjectGradeBox(item.Fach)
    );

    for (const promise of promises) {
        const box = await promise;
        subjectGradeList.appendChild(box);
    }
    await hideLoading();

}

async function showSubjectPage(subject) {
    hideAllPages();
    subjectPage.style.display = "block";
    document.getElementById("menu").close();
    enableScroll();

    subjectPage.innerHTML = "";

    await showLoading();

    const box = await createSubjectGradeBox(subject);

    subjectPage.appendChild(box);

    await hideLoading();
}

export async function showFruehwarnungPage() {
    hideAllPages();
    fruewarnungPage.style.display = "block";
    document.getElementById("menu").close();

    const fruewarnungTable = document.getElementById("fruewarnungTable");

    const response = await getFruewarnungen(session.matrikelNr, session.accessToken);

    if (response.status === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const data = await response.data;

    if (data.length === 0) {
        fruewarnungTable.innerHTML = "";

        const div = document.createElement("div");
        div.innerHTML = `<p>Keine Frühwarnungen vorhanden</p>`;
        div.classList.add("fruewarnung-empty");
        fruewarnungTable.appendChild(div);
        return;
    }

    const responseLehrer = await getLehrer(session.matrikelNr, session.accessToken);

    if (responseLehrer.status < 200 || responseLehrer.status >= 300) {
        logout(true);
        return;
    }

    const lehrer = await responseLehrer.data;

    fruewarnungTable.innerHTML = `
        <tr class="fruewarnung-table-header">
            <th style="width: 25%;">Fach</th>
            <th style="width: 45%;">Lehrer</th>
            <th style="width: 30%;">Datum</th>
        </tr>
    `;

    data.forEach(item => {
        const formatedDate = formatDate(item.Eingetragen, true);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.Fach}</td>
            <td>${lehrer.find(i => i.Lehrer_ID === item.Lehrer_ID).Nachname} ${lehrer.find(i => i.Lehrer_ID === item.Lehrer_ID).Vorname}</td>
            <td>${formatedDate}</td>
        `;

        row.classList.add("fruewarnung-table-data");

        fruewarnungTable.appendChild(row);
    });
}

export async function showFehlstundenPage() {
    hideAllPages();
    fehlstundenPage.style.display = "block";
    document.getElementById("menu").close();

    const response = await getFehlstunden(session.matrikelNr, session.accessToken);

    if (response === 0) {
        showToast(TIMEOUT_MESSAGE, false, 'center');
        return;
    }

    if (response.status < 200 || response.status >= 300) {
        logout(true);
        return;
    }

    const data = await response.data;

    const open = data.Fehlstunden_Offen;
    const notExcused = data.Fehlstunden_NichtEntschuldigt;
    const excused = data.Fehlstunden_Entschuldigt;
    const total = open + notExcused + excused;

    document.getElementById("absencesTotal").innerHTML = total;
    document.getElementById("absencesOpen").innerHTML = open
    document.getElementById("absencesExcused").innerHTML = excused;
    document.getElementById("absencesNotExcused").innerHTML = notExcused;
}

export async function showWhereIsMyTeacherPage() {
    hideAllPages();
    whereIsMyTeacherPage.style.display = "block";
    document.getElementById("menu").close();

    const teacherSelect = document.getElementById("whereIsMyTeacherList");
    const table = document.getElementById("whereIsMyTeacherTable");

    table.innerHTML = "";

    const lehrerList = await getLehrerListUntis();

    if (lehrerList === null) {
        showToast("Connection failed. Check your internet.", false, 'center');
        return;
    }

    teacherSelect.innerHTML = lehrerList;
}

export async function whereIsMyTeacherShowData() {
    const teacherSelect = document.getElementById("whereIsMyTeacherList");
    const table = document.getElementById("whereIsMyTeacherTable");

    const teacherID = teacherSelect.value;

    showLoading();
    const response = await getLehrerDataUntis(teacherID);

    table.innerHTML = response.data;
    hideLoading();
}

export async function showSettingsPage() {
    hideAllPages();
    settingsPage.style.display = "block";
    document.getElementById("menu").close();
}

export function showInfoPage() {
    hideAllPages();
    infoPage.style.display = "block";
    document.getElementById("menu").close();
}

function createTemplateChart() {
    return new Chart(document.getElementById('notenspiegelChart'),
    {
        type: 'bar',
        data: {
            labels: [1, 2, 3, 4, 5, "Gefehlt"],
            datasets: [{
                label: "Noten",
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#2B9152',
                    '#8EB897',
                    '#FFD447',
                    '#FA7921',
                    '#A50104',
                    '#A6A6A6',
                ],
            }]
        },
        options: {
            animation: {
                duration: 0
            },
            animations: {
                y: {
                    duration: 1500,
                    from: ctx => ctx.chart.scales.y.getPixelForValue(0)
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

async function showLFdetailsPage(LF_ID) {
    hideAllPages();
    LFdetailsPage.style.display = "block";
    document.getElementById("menu").close();

    if (chart === null) {
        chart = createTemplateChart();
    }

    const LFheaderName = document.getElementById("LFheaderName");
    const LFheaderDetails = document.getElementById("LFheaderDetails");
    const LFgrade = document.getElementById("LFgrade");
    const LFpoints = document.getElementById("LFpoints");
    const LFpercent = document.getElementById("LFpercent");
    const LFcomment = document.getElementById("LFcomment");
    const row = document.getElementById("LFtableData");
    const LFnotenspiegel = document.getElementById("LFnotenspiegel");
    const gradeOne = document.getElementById("gradeOne");
    const gradeTwo = document.getElementById("gradeTwo");
    const gradeThree = document.getElementById("gradeThree");
    const gradeFour = document.getElementById("gradeFour");
    const gradeFive = document.getElementById("gradeFive");
    const gradeMissing = document.getElementById("gradeMissing");
    const gradeAverage = document.getElementById("gradeAverage");
    const notenspiegelChart = document.getElementById("notenspiegelChart");
    
    LFheaderName.textContent = "";
    LFheaderDetails.textContent = "";
    LFgrade.textContent = "";
    LFpoints.textContent = "";
    LFpercent.textContent = "";
    LFcomment.textContent = "";
    row.classList.remove("n0", "n1", "n2", "n3", "n4", "n5");
    LFnotenspiegel.style.display = "none";
    notenspiegelChart.style.display = "none";

    await showLoading();

    const dataResponse = await getLFdata(session.matrikelNr, session.accessToken, LF_ID);   

    if (dataResponse.status < 200 || dataResponse.status >= 300) {
        logout(true);
        return;
    }

    const data = dataResponse.data;


    const gradeResponse = await getLFgrade(session.matrikelNr, session.accessToken, LF_ID);

    if (gradeResponse.status < 200 || gradeResponse.status >= 300) {
        logout(true);
        return;
    }

    const grade = gradeResponse.data;

    const formatedDate = formatDate(data.Datum);

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
    LFheaderDetails.textContent = `${formatedDate}, ${data.Kommentar}`;

    LFgrade.innerHTML = note;
    LFpoints.innerHTML = points;
    LFpercent.innerHTML = percent;
    LFcomment.innerHTML = grade.Kommentar;

    row.classList.add(getGradeClass(data.Note, data.Punkte, data.MaxPunkte));

    if (data.Notenspiegel !== null) {
        const average = (data.Notenspiegel[0] * 1 +
                        data.Notenspiegel[1] * 2 +
                        data.Notenspiegel[2] * 3 +
                        data.Notenspiegel[3] * 4 +
                        data.Notenspiegel[4] * 5) / (data.Notenspiegel[0] + data.Notenspiegel[1] + data.Notenspiegel[2] + data.Notenspiegel[3] + data.Notenspiegel[4]);

        gradeOne.innerHTML = data.Notenspiegel[0];
        gradeTwo.innerHTML = data.Notenspiegel[1];
        gradeThree.innerHTML = data.Notenspiegel[2];
        gradeFour.innerHTML = data.Notenspiegel[3];
        gradeFive.innerHTML = data.Notenspiegel[4];
        gradeMissing.innerHTML = data.Notenspiegel[5];
        gradeAverage.innerHTML = average.toFixed(2);

        
        chart.data.datasets[0].data = [
            data.Notenspiegel[0],
            data.Notenspiegel[1],
            data.Notenspiegel[2],
            data.Notenspiegel[3],
            data.Notenspiegel[4],
            data.Notenspiegel[5]
        ]
        chart.update();
        
        LFnotenspiegel.style.display = "block";
        notenspiegelChart.style.display = "block";
    }

    await hideLoading();
}