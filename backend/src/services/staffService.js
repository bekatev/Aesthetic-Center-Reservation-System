/**
 * Staff service: CRUD for specialists.
 * Search uses ILIKE on first_name and last_name.
 */
const { query } = require('../db/pool');

async function listStaff(search = '') {
  const searchTerm = `%${search.trim()}%`;
  const result = await query(
    `SELECT id, first_name, last_name, photo_url, created_at, updated_at
     FROM staff
     WHERE ($1::text = '' OR first_name ILIKE $1 OR last_name ILIKE $1)
     ORDER BY last_name, first_name`,
    [searchTerm]
  );
  return result.rows;
}

async function createStaff({ first_name, last_name, photo_url }) {
  if (!first_name?.trim() || !last_name?.trim()) {
    const err = new Error('First name and last name are required');
    err.status = 400;
    throw err;
  }
  const result = await query(
    `INSERT INTO staff (first_name, last_name, photo_url)
     VALUES ($1, $2, $3)
     RETURNING id, first_name, last_name, photo_url, created_at, updated_at`,
    [first_name.trim(), last_name.trim(), photo_url || null]
  );
  return result.rows[0];
}

async function updateStaff(id, { first_name, last_name, photo_url }) {
  if (!first_name?.trim() || !last_name?.trim()) {
    const err = new Error('First name and last name are required');
    err.status = 400;
    throw err;
  }
  const result = await query(
    `UPDATE staff SET first_name = $1, last_name = $2, photo_url = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, first_name, last_name, photo_url, created_at, updated_at`,
    [first_name.trim(), last_name.trim(), photo_url ?? null, id]
  );
  if (result.rows.length === 0) {
    const err = new Error('Staff not found');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
}

async function deleteStaff(id) {
  const result = await query('DELETE FROM staff WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    const err = new Error('Staff not found');
    err.status = 404;
    throw err;
  }
}

module.exports = { listStaff, createStaff, updateStaff, deleteStaff };
