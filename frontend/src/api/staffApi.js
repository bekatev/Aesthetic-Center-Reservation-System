/**
 * Staff API: list, create, update, delete specialists.
 */
import { request } from './client';

export async function getStaff(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/staff${params}`);
}

export async function createStaff(data) {
  return request('/staff', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateStaff(id, data) {
  return request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteStaff(id) {
  return request(`/staff/${id}`, { method: 'DELETE' });
}
