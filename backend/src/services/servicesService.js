/**
 * Services service: CRUD with custom field values.
 * On delete, also removes reservations that end up with no services.
 */
const { query, withTransaction } = require('../db/pool');
const serviceFieldsService = require('./serviceFieldsService');

async function listServicesWithFields() {
  const columns = await serviceFieldsService.getColumnDefinitions();
  const servicesResult = await query(
    `SELECT id, name, price, color, created_at, updated_at FROM services ORDER BY name`
  );
  const valuesResult = await query(
    `SELECT scfv.service_id, scfv.field_id, scfv.value
     FROM service_custom_field_values scfv`
  );

  /** Map service_id -> field_id -> value for custom field values. */
  const valuesByService = {};
  for (const v of valuesResult.rows) {
    if (!valuesByService[v.service_id]) valuesByService[v.service_id] = {};
    valuesByService[v.service_id][v.field_id] = v.value;
  }

  const services = servicesResult.rows.map((s) => {
    const customFields = {};
    for (const col of columns) {
      if (col.field_id != null) {
        customFields[col.column_key] = valuesByService[s.id]?.[col.field_id] ?? '';
      }
    }
    return {
      ...s,
      price: parseFloat(s.price),
      custom_fields: customFields,
    };
  });

  return { services, columns };
}

async function createServiceWithFields(body) {
  const { name, price, color, custom_fields = {} } = body;

  if (!name?.trim()) {
    const err = new Error('Service name is required');
    err.status = 400;
    throw err;
  }
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    const err = new Error('Valid price is required');
    err.status = 400;
    throw err;
  }
  if (!color?.trim()) {
    const err = new Error('Color is required');
    err.status = 400;
    throw err;
  }

  const serviceResult = await query(
    `INSERT INTO services (name, price, color) VALUES ($1, $2, $3)
     RETURNING id, name, price, color, created_at, updated_at`,
    [name.trim(), priceNum, color.trim()]
  );
  const service = serviceResult.rows[0];

  for (const [key, value] of Object.entries(custom_fields)) {
    const fieldId = key.startsWith('field_') ? key.replace('field_', '') : null;
    if (fieldId && value != null && value !== '') {
      await query(
        `INSERT INTO service_custom_field_values (service_id, field_id, value) VALUES ($1, $2, $3)
         ON CONFLICT (service_id, field_id) DO UPDATE SET value = EXCLUDED.value`,
        [service.id, fieldId, String(value)]
      );
    }
  }

  return { ...service, price: parseFloat(service.price), custom_fields: custom_fields };
}

async function updateServiceWithFields(id, body) {
  const { name, price, color, custom_fields = {} } = body;

  const existing = await query('SELECT id FROM services WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    const err = new Error('Service not found');
    err.status = 404;
    throw err;
  }

  const updates = [];
  const params = [];
  let idx = 1;

  if (name != null) {
    if (!name.trim()) {
      const err = new Error('Service name cannot be empty');
      err.status = 400;
      throw err;
    }
    updates.push(`name = $${idx++}`);
    params.push(name.trim());
  }
  if (price != null) {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      const err = new Error('Valid price is required');
      err.status = 400;
      throw err;
    }
    updates.push(`price = $${idx++}`);
    params.push(priceNum);
  }
  if (color != null) {
    updates.push(`color = $${idx++}`);
    params.push(color.trim());
  }

  if (updates.length > 0) {
    params.push(id);
    await query(
      `UPDATE services SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
      params
    );
  }

  for (const [key, value] of Object.entries(custom_fields)) {
    const fieldId = key.startsWith('field_') ? key.replace('field_', '') : null;
    if (fieldId) {
      await query(
        `INSERT INTO service_custom_field_values (service_id, field_id, value) VALUES ($1, $2, $3)
         ON CONFLICT (service_id, field_id) DO UPDATE SET value = EXCLUDED.value`,
        [id, fieldId, value != null ? String(value) : '']
      );
    }
  }

  const result = await query(
    'SELECT id, name, price, color, created_at, updated_at FROM services WHERE id = $1',
    [id]
  );
  const service = result.rows[0];
  return { ...service, price: parseFloat(service.price), custom_fields };
}

async function deleteService(id) {
  await withTransaction(async (client) => {
    const result = await client.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      const err = new Error('Service not found');
      err.status = 404;
      throw err;
    }
    // Remove service from reservation_services (CASCADE does this automatically).
    // Delete reservations that now have no services left.
    await client.query(
      `DELETE FROM reservations
       WHERE id IN (
         SELECT r.id FROM reservations r
         WHERE NOT EXISTS (SELECT 1 FROM reservation_services rs WHERE rs.reservation_id = r.id)
       )`
    );
  });
}

module.exports = {
  listServicesWithFields,
  createServiceWithFields,
  updateServiceWithFields,
  deleteService,
};
