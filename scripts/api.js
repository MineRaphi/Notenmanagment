const URL = `https://notenmanagement.htl-braunau.at/rest`;

export async function loginRequest(username, password) {
    return fetch(URL + '/Token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=password&username=${username}&password=${password}`
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