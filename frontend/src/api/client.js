/**
 * Base HTTP client for the API.
 * All API modules use this to talk to the backend. VITE_API_URL can override the base URL.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Generic fetch wrapper: JSON body, throws on non-2xx with error message from response. */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export { API_BASE, request };
