import { CapacitorHttp } from '@capacitor/core';
import { API_URL, DEFAULT_TIMEOUT_MS } from './config';

async function request(options, timeoutMs=DEFAULT_TIMEOUT_MS) {
    try {
        return await Promise.race([
            CapacitorHttp.request(options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
            )
        ]);
    } catch (error) {
        return { status: 0, data: null };
    }
}

export async function loginRequest(username, password) {
    return request({
        method: 'POST',
        url: API_URL + '/Token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
            grant_type: 'password',
            username: username,
            password: password
        }
    });
}

export async function getStudentInfo(matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLatestGrades(matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}/Noten?limit=5&sort=-Datum`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getSubjectsWithGrade(matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}/Faecher?sort=Fach`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getGradesFromSubject(matrikelNr, token, subject) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}/Faecher/${subject}/Noten?sort=-Datum`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getFruewarnungen(matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}/Fruehwarnungen?sort=Fach`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getFehlstunden(matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Schueler/${matrikelNr}/Fehlstunden`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLFdata(_matrikelNr, token, LF_ID) {
    return request({
        method: 'GET',
        url: API_URL + `/api/LFs/${LF_ID}`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLFgrade(matrikelNr, token, LF_ID) {
    return request({
        method: 'GET',
        url: API_URL + `/api/LFs/${LF_ID}/Schueler/${matrikelNr}/Noten`,
        headers: { 'Authorization': `bearer ${token}` }
    })
}

export async function getLehrer(_matrikelNr, token) {
    return request({
        method: 'GET',
        url: API_URL + `/api/Lehrer`,
        headers: { 'Authorization': `bearer ${token}` }
    });
}

export async function getLehrerListUntis() {
    const response = await request({
        method: 'GET',
        url: 'https://services01.htl-braunau.at/WhereIsMyTeacher/',
    });

    if (response.status === 0) {
        return null;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, "text/html");

    return doc.getElementById("teacherlist")?.innerHTML;
}

export async function getLehrerDataUntis(teacherID) {
    return request({
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
