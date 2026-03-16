/**
 * Photo upload and URL helpers.
 * Photos are stored under /uploads on the server; getPhotoUrl turns relative paths into full URLs.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ROOT_URL = API_BASE.replace('/api', '');

/** Convert relative upload path (e.g. /uploads/...) to full URL for <img src>. */
export function getPhotoUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ROOT_URL}${url}`;
}

/** Upload a file; returns the server path (e.g. /uploads/staff-123.jpg). */
export async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data.url;
}
