/**
 * Returns full API URL for the given endpoint.
 * - If REACT_APP_API_URL is set (e.g. https://api.example.com): cross-origin, browser sends OPTIONS (CORS preflight).
 * - If REACT_APP_API_URL is empty or same-origin path (e.g. '' or '/api'): same-origin, no OPTIONS.
 * For production, use same-origin (empty or '/api') and proxy /api to your backend to avoid CORS/OPTIONS.
 */
export const getApiUrl = (endpoint: string) => {
  const apiUrl = process.env.REACT_APP_API_URL ?? '';
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!apiUrl) {
    return path; // same-origin, no CORS preflight
  }
  const base = apiUrl.replace(/\/$/, '');
  return `${base}${path}`;
};
