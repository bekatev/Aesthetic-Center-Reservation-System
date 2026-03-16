/**
 * Reservations API: fetch by date, create, update, delete.
 */
import { request } from './client';

export async function getReservations(date) {
  return request(`/reservations?date=${encodeURIComponent(date)}`);
}

export async function createReservation(data) {
  return request('/reservations', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateReservation(id, data) {
  return request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteReservation(id) {
  return request(`/reservations/${id}`, { method: 'DELETE' });
}
