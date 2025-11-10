const URL = `https://notenmanagement.htl-braunau.at/rest`;

export async function loginRequest(username, password) {
    return fetch(URL + '/Token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
}

export async function getStudentInfo(matrikelNr, token) {
    return fetch(URL + `/api/Schueler/${matrikelNr}`, {
        headers: { 'Authorization': `bearer ${token}` }
    });
}

export async function getLatestGrades(matrikelNr, token) {
    return fetch(URL + `/api/Schueler/${matrikelNr}/Noten?limit=5&sort=-Datum`, {
        headers: { 'Authorization': `bearer ${token}` }
    });
}

export async function getAllGrades(matrikelNr, token) {
    return fetch(URL + `/api/Schueler/${matrikelNr}/Noten?sort=Fach`, {
        headers: { 'Authorization': `bearer ${token}` }
    });
}

export async function getSubjectsWithGrade(matrikelNr, token) {
    return fetch(URL + `/api/Schueler/${matrikelNr}/Faecher?sort=Fach`, {
        headers: { 'Authorization': `bearer ${token}` }
    });
}