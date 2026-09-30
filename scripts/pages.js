import { getLatestGrades, getSubjectsWithGrade, getGradesFromSubject, getFruewarnungen, getFehlstunden, getLFdata, getLFgrade, getLehrer, getLehrerListUntis, getLehrerDataUntis } from './api.js';
import { showToast, enableScroll, disableScroll } from './ui.js';
import Chart from 'chart.js/auto';
import { session } from './session.js';
import { loadCached } from './cache.js';

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

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
                <p>${escapeHtml(data.Fach)}</p>
                <p>${escapeHtml(data.Typ)}</p>
            </div>
                <p class="date">${formatedDate}</p>
            <div class="grade">
                ${data.Note !== null ? `<p>Note <b>${escapeHtml(data.Note)}</b></p>` : ''}
                ${data.Punkte !== null ? `<p>${escapeHtml(data.Punkte)}/${escapeHtml(data.MaxPunkte)}</p>` : ''}
            </div>
        `;
    }
    else {
        box.innerHTML = `
            <div class="subject-type">
                <p>${escapeHtml(data.Fach)}</p>
                <p>${escapeHtml(data.Typ)}</p>
            </div>
                <p class="date">${formatedDate}</p>
            <div class="grade">
                <p><b style="font-size: 15px;">Gefehlt</b></p>
                ${data.Punkte !== null ? `<p>${escapeHtml(data.Punkte)}/${escapeHtml(data.MaxPunkte)}</p>` : ''}
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

async function renderStartPage(data) {
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

export async function showStartPage() {
    hideAllPages();
    document.getElementById("main").style.display = "block";
    startPage.style.display = "block";
    document.getElementById("menu").close();
    document.getElementById("menu").disabled = false;

    await showLoading();

    await loadCached(
        `latestGrades:${session.matrikelNr}`,
        () => getLatestGrades(session.matrikelNr, session.accessToken),
        renderStartPage,
        900
    );

    await hideLoading();
}

function renderSubjectGradeBox(container, subject, data) {
    container.innerHTML = `<h3 class="subject-grades-header">${escapeHtml(subject)}</h3>`;

    const gradeTable = document.createElement("table");
    gradeTable.style.minWidth = "100%";
    gradeTable.style.marginTop = "0px";

    const headRow = document.createElement("tr");
    headRow.classList.add("subject-grades-header-row");
    headRow.style.height = "35px";
    headRow.innerHTML = `<th>Datum</th><th>Info</th><th>Note</th><th>Punkte</th><th>Prozent</th>`;
    gradeTable.appendChild(headRow);

    data.forEach(item => {
        const row = document.createElement("tr");
        row.style.height = "45px";
        row.addEventListener("click", () => showLFdetailsPage(item.LF_ID));

        const formatedDate = formatDate(item.Datum, true);
        const type = item.Typ.replace("Semesternote", "Semester");
        let grade = item.Note;
        let points = `${item.Punkte}/${item.MaxPunkte}`;
        let percent = `${(item.Punkte / item.MaxPunkte * 100).toFixed(2)}%<span style="color: #00000000">.</span>`;
        let gradeSpan = 1;

        if (grade === null) grade = "";
        if (item.Punkte === null || item.MaxPunkte === null) { points = ""; percent = ""; }
        if (grade === 0) { gradeSpan = 2; grade = "Gefehlt"; }

        row.innerHTML = `
            <td style="width: 19%; text-align: end;">${escapeHtml(formatedDate)}</td>
            <td style="width: 27%; text-align: center;">${escapeHtml(type)}</td>
            <td style="width: 15%; text-align: center;" colspan=${escapeHtml(gradeSpan)}>${escapeHtml(grade)}</td>
            <td style="width: 20%; text-align: center;">${escapeHtml(points)}</td>
            <td style="width: 19%; text-align: end;">${percent} </td>
        `;

        row.classList.add(getGradeClass(item.Note, item.Punkte, item.MaxPunkte));
        gradeTable.appendChild(row);
    });

    container.appendChild(gradeTable);
}

async function loadSubjectGradeBox(subject, container) {
    await showLoading();

    await loadCached(
        `gradesFromSubject:${session.matrikelNr}:${subject}`,
        () => getGradesFromSubject(session.matrikelNr, session.accessToken, subject),
        (data) => renderSubjectGradeBox(container, subject, data),
        900
    );

    await hideLoading();
}

async function renderSubjectlist(data) {
    const subjectList = document.getElementById("subjectList");
    const subjectGradeList = document.getElementById("subjectGradeList");

    subjectList.innerHTML = "";
    subjectGradeList.innerHTML = "";

    data.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `<p>${escapeHtml(item.Fach)}</p>`;
        div.addEventListener("click", () => showSubjectPage(item.Fach));
        subjectList.appendChild(div);
    });

    const containers = data.map(item => {
        const container = document.createElement("div");
        container.classList.add('subject-grades-list');
        subjectGradeList.appendChild(container);   // placed immediately, in the right order
        return { subject: item.Fach, container };
    });

    await Promise.all(
        containers.map(({ subject, container }) => loadSubjectGradeBox(subject, container))
    );
}

export async function showNotenPage() {
    hideAllPages();
    notenPage.style.display = "block";
    document.getElementById("menu").close();
    enableScroll();

    await showLoading();

    await loadCached(
        `subjectsWithGrade:${session.matrikelNr}`,
        () => getSubjectsWithGrade(session.matrikelNr, session.accessToken),
        renderSubjectlist,
        900
    );

    await hideLoading();
}

async function showSubjectPage(subject) {
    hideAllPages();
    subjectPage.style.display = "block";
    document.getElementById("menu").close();
    enableScroll();

    subjectPage.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add('subject-grades-list');
    subjectPage.appendChild(container);

    await showLoading();
    
    await loadSubjectGradeBox(subject, container);

    await hideLoading();
}

function renderFruehwarnungPage(data, lehrer) {
    const fruewarnungTable = document.getElementById("fruewarnungTable");

    if (data.length === 0) {
        fruewarnungTable.innerHTML = "";

        const div = document.createElement("div");
        div.innerHTML = `<p>Keine Frühwarnungen vorhanden</p>`;
        div.classList.add("fruewarnung-empty");
        fruewarnungTable.appendChild(div);
        return;
    }

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
            <td>${escapeHtml(item.Fach)}</td>
            <td>${escapeHtml(lehrer.find(i => i.Lehrer_ID === item.Lehrer_ID).Nachname)} ${escapeHtml(lehrer.find(i => i.Lehrer_ID === item.Lehrer_ID).Vorname)}</td>
            <td>${escapeHtml(formatedDate)}</td>
            `;

        row.classList.add("fruewarnung-table-data");

        fruewarnungTable.appendChild(row);
    });
}

export async function showFruehwarnungPage() {
    hideAllPages();
    fruewarnungPage.style.display = "block";
    document.getElementById("menu").close();

    await showLoading();
    
    await loadCached(
        `fruehwarnung:${session.matrikelNr}`,
        () => getFruewarnungen(session.matrikelNr, session.accessToken),
        async (data) => {
            await loadCached(
                `lehrer:${session.matrikelNr}`,
                () => getLehrer(session.matrikelNr, session.accessToken),
                (lehrer) => renderFruehwarnungPage(data, lehrer), 
                86400
            );
        },
        900
    );

    await hideLoading();
}

function renderFehlstundenPage(data) {
    const open = data.Fehlstunden_Offen;
    const notExcused = data.Fehlstunden_NichtEntschuldigt;
    const excused = data.Fehlstunden_Entschuldigt;
    const total = open + notExcused + excused;

    document.getElementById("absencesTotal").innerHTML = escapeHtml(total);
    document.getElementById("absencesOpen").innerHTML = escapeHtml(open);
    document.getElementById("absencesExcused").innerHTML = escapeHtml(excused);
    document.getElementById("absencesNotExcused").innerHTML = escapeHtml(notExcused);
}

export async function showFehlstundenPage() {
    hideAllPages();
    fehlstundenPage.style.display = "block";
    document.getElementById("menu").close();

    await showLoading();

    await loadCached(
        `fehlstunden:${session.matrikelNr}`,
        () => getFehlstunden(session.matrikelNr, session.accessToken),
        renderFehlstundenPage,
        900
    );

    await hideLoading();
}

function renderWhereIsMyTeacherPage(lehrerList) {
    const teacherSelect = document.getElementById("whereIsMyTeacherList");

    if (lehrerList === null) {
        showToast("Connection failed. Check your internet.", false, 'center');
        return;
    }

    teacherSelect.innerHTML = lehrerList;
}

export async function showWhereIsMyTeacherPage() {
    hideAllPages();
    whereIsMyTeacherPage.style.display = "block";
    document.getElementById("menu").close();

    const table = document.getElementById("whereIsMyTeacherTable");

    table.innerHTML = "";

    await showLoading();

    await loadCached(
        `whereIsMyTeacherTeachers:${session.matrikelNr}`,
        () => getLehrerListUntis(),
        renderWhereIsMyTeacherPage,
        3600
    );

    await hideLoading();
}

async function whereIsMyTeacherRenderData(data) {
    const table = document.getElementById("whereIsMyTeacherTable");

    table.innerHTML = data;
}

export async function whereIsMyTeacherShowData() {
    const teacherSelect = document.getElementById("whereIsMyTeacherList");

    const teacherID = teacherSelect.value;

    await loadCached(
        `whereIsMyTeacherData:${session.matrikelNr}:${teacherID}`,
        () => getLehrerDataUntis(teacherID),
        whereIsMyTeacherRenderData,
        300
    );

    await hideLoading();
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

function renderLFdetailsPage(data, grade) {
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

    LFgrade.innerHTML = escapeHtml(note);
    LFpoints.innerHTML = escapeHtml(points);
    LFpercent.innerHTML = escapeHtml(percent);
    LFcomment.innerHTML = escapeHtml(grade.Kommentar);

    row.classList.add(getGradeClass(grade.Note, grade.Punkte, data.MaxPunkte));

    if (data.Notenspiegel !== null) {
        const average = (data.Notenspiegel[0] * 1 +
                        data.Notenspiegel[1] * 2 +
                        data.Notenspiegel[2] * 3 +
                        data.Notenspiegel[3] * 4 +
                        data.Notenspiegel[4] * 5) / (data.Notenspiegel[0] + data.Notenspiegel[1] + data.Notenspiegel[2] + data.Notenspiegel[3] + data.Notenspiegel[4]);

        gradeOne.innerHTML = escapeHtml(data.Notenspiegel[0]);
        gradeTwo.innerHTML = escapeHtml(data.Notenspiegel[1]);
        gradeThree.innerHTML = escapeHtml(data.Notenspiegel[2]);
        gradeFour.innerHTML = escapeHtml(data.Notenspiegel[3]);
        gradeFive.innerHTML = escapeHtml(data.Notenspiegel[4]);
        gradeMissing.innerHTML = escapeHtml(data.Notenspiegel[5]);
        gradeAverage.innerHTML = escapeHtml(average.toFixed(2));

        
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
}

async function showLFdetailsPage(LF_ID) {
    hideAllPages();
    LFdetailsPage.style.display = "block";
    document.getElementById("menu").close();

    if (chart === null) {
        chart = createTemplateChart();
    }

    document.getElementById("LFheaderName").textContent = "";
    document.getElementById("LFheaderDetails").textContent = "";
    document.getElementById("LFgrade").textContent = "";
    document.getElementById("LFpoints").textContent = "";
    document.getElementById("LFpercent").textContent = "";
    document.getElementById("LFcomment").textContent = "";
    document.getElementById("LFtableData").classList.remove("n0", "n1", "n2", "n3", "n4", "n5");
    document.getElementById("LFnotenspiegel").style.display = "none";
    document.getElementById("notenspiegelChart").style.display = "none";

    await showLoading();

    await loadCached(
        `LFdetails:${session.matrikelNr}:${LF_ID}`,
        () => getLFdata(session.matrikelNr, session.accessToken, LF_ID),
        async (data) => {
            await loadCached(
                `LFdetailsGrade:${session.matrikelNr}:${LF_ID}`,
                () => getLFgrade(session.matrikelNr, session.accessToken, LF_ID),
                (grade) => renderLFdetailsPage(data, grade),
                900
            );
        },
        900
    );

    await hideLoading();
}

export function clearPages() {
    startPage.innerHTML = "";
    subjectPage.innerHTML = "";
    document.getElementById("subjectList").innerHTML = "";
    document.getElementById("subjectGradeList").innerHTML = "";
    document.getElementById("fruewarnungTable").innerHTML = "";

    for (const id of ["absencesTotal", "absencesOpen", "absencesExcused", "absencesNotExcused"]) {
        document.getElementById(id).textContent = "...";
    }

    for (const id of ["LFheaderName", "LFheaderDetails", "LFgrade", "LFpoints", "LFpercent", "LFcomment",
                      "gradeOne", "gradeTwo", "gradeThree", "gradeFour", "gradeFive", "gradeMissing", "gradeAverage"]) {
        document.getElementById(id).textContent = "";
    }

    if (chart !== null) {
        chart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        chart.update();
    }
}