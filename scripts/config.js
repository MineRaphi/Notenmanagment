export const API_URL = import.meta.env.MODE == "dev" ? `https://notenmanagement.htl-braunau.at/work/rest`: `https://notenmanagement.htl-braunau.at/rest`;

export const TIMEOUT_MESSAGE = "Connection failed. Check your internet.";
export const DEFAULT_TIMEOUT_MS = 5000

export const LOADING_SPINNER_TIMEOUT_MS = 10000;