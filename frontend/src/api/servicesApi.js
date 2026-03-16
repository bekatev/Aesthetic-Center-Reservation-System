/**
 * Services API: CRUD for services plus custom columns and column order.
 */
import { request } from './client';

export async function getServices() {
  return request('/services');
}

export async function createService(data) {
  return request('/services', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateService(id, data) {
  return request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteService(id) {
  return request(`/services/${id}`, { method: 'DELETE' });
}

export async function getColumnDefinitions() {
  return request('/service-fields');
}

export async function createCustomField(name) {
  return request('/service-fields', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function deleteCustomField(id) {
  return request(`/service-fields/${id}`, { method: 'DELETE' });
}

export async function updateColumnOrder(order) {
  return request('/service-fields/column-order', { method: 'PUT', body: JSON.stringify({ order }) });
}
