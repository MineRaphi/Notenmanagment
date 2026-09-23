import { CapacitorHttp } from '@capacitor/core';

//const URL = `https://notenmanagement.htl-braunau.at/rest`;    // real life url
const URL = `http://127.0.0.1:8000`;    // dev testing url

export async function loginRequest(username, password) {
    return CapacitorHttp.request({
        method: 'POST',
        url: URL + '/Token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
}

export async function getStudentInfo(matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLatestGrades(matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}/Noten?limit=5&sort=-Datum`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getSubjectsWithGrade(matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}/Faecher?sort=Fach`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getGradesFromSubject(matrikelNr, token, subject) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}/Faecher/${subject}/Noten?sort=-Datum`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getFruewarnungen(matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}/Fruehwarnungen?sort=Fach`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getFehlstunden(matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Schueler/${matrikelNr}/Fehlstunden`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLFdata(_matrikelNr, token, LF_ID) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/LFs/${LF_ID}`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLFgrade(matrikelNr, token, LF_ID) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/LFs/${LF_ID}/Schueler/${matrikelNr}/Noten`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLehrer(_matrikelNr, token) {
    return CapacitorHttp.request({
        method: 'GET',
        url: URL + `/api/Lehrer`,
        headers: { 'Authorization': `bearer ${token}` }
    });
}

export async function getLehrerListUntis() {
    const response = await CapacitorHttp.request({
        method: 'GET',
        url: 'https://services01.htl-braunau.at/WhereIsMyTeacher/',
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, "text/html");

    return doc.getElementById("teacherlist")?.innerHTML;
}

export async function getLehrerDataUntis(teacherID) {
    return CapacitorHttp.request({
        method: 'POST',
        url: 'https://services01.htl-braunau.at/WhereIsMyTeacher/data.php',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            action: 'getSchedule',
            teacherid: teacherID
        }
    });
}
