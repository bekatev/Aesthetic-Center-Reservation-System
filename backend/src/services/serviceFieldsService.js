/**
 * Custom column definitions and column order.
 * Merges base columns (color, name, price) with custom fields from column_preferences.
 */
const { query } = require('../db/pool');

async function getColumnDefinitions() {
  /** Base columns always exist; custom fields come from service_custom_fields. */
  const baseColumns = [
    { column_key: 'color', field_id: null, position: 0, name: 'Color' },
    { column_key: 'name', field_id: null, position: 1, name: 'Name' },
    { column_key: 'price', field_id: null, position: 2, name: 'Price' },
  ];

  const prefsResult = await query(
    `SELECT column_key, field_id, position FROM column_preferences ORDER BY position`
  );

  const customResult = await query(
    `SELECT id, name, position FROM service_custom_fields ORDER BY position`
  );

  const customMap = Object.fromEntries(customResult.rows.map((r) => [r.id, r]));

  const ordered = [];
  for (const row of prefsResult.rows) {
    if (row.field_id) {
      const cf = customMap[row.field_id];
      if (cf) ordered.push({ column_key: `field_${cf.id}`, field_id: cf.id, position: row.position, name: cf.name });
    } else {
      const base = baseColumns.find((b) => b.column_key === row.column_key);
      if (base) ordered.push({ ...base, position: row.position });
    }
  }

  const usedKeys = new Set(ordered.map((o) => o.column_key));
  for (const b of baseColumns) {
    if (!usedKeys.has(b.column_key)) ordered.push(b);
  }
  for (const cf of customResult.rows) {
    const key = `field_${cf.id}`;
    if (!usedKeys.has(key)) {
      ordered.push({ column_key: key, field_id: cf.id, position: 100 + cf.position, name: cf.name });
    }
  }

  ordered.sort((a, b) => a.position - b.position);
  return ordered;
}

async function createCustomField(name) {
  if (!name?.trim()) {
    const err = new Error('Field name is required');
    err.status = 400;
    throw err;
  }
  const maxPos = await query('SELECT COALESCE(MAX(position), 0) as m FROM service_custom_fields');
  const position = (maxPos.rows[0]?.m ?? 0) + 1;

  const insertResult = await query(
    `INSERT INTO service_custom_fields (name, position) VALUES ($1, $2)
     RETURNING id, name, position`,
    [name.trim(), position]
  );

  const field = insertResult.rows[0];
  const maxPrefPos = await query('SELECT COALESCE(MAX(position), -1) as m FROM column_preferences');
  const prefPosition = (maxPrefPos.rows[0]?.m ?? -1) + 1;

  await query(
    `INSERT INTO column_preferences (column_key, field_id, position) VALUES ($1, $2, $3)`,
    [`field_${field.id}`, field.id, prefPosition]
  );

  return field;
}

async function updateColumnOrder(order) {
  if (!Array.isArray(order) || order.length === 0) return;

  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    const columnKey = typeof item === 'string' ? item : item.column_key;
    const fieldId = typeof item === 'object' && item.field_id != null ? item.field_id : null;

    await query(
      `INSERT INTO column_preferences (column_key, field_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (column_key) DO UPDATE SET field_id = EXCLUDED.field_id, position = EXCLUDED.position, updated_at = NOW()`,
      [columnKey, fieldId, i]
    );
  }
}

async function deleteCustomField(id) {
  const result = await query(
    'DELETE FROM service_custom_fields WHERE id = $1 RETURNING id',
    [id]
  );
  if (result.rows.length === 0) {
    const err = new Error('Custom field not found');
    err.status = 404;
    throw err;
  }
}

module.exports = { getColumnDefinitions, createCustomField, updateColumnOrder, deleteCustomField };
