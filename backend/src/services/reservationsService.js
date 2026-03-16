/**
 * Reservations service: daily schedule, create/update with overlap validation.
 * Uses time-in-minutes for overlap checks; returns enriched reservation objects with services.
 */
const { query, withTransaction } = require('../db/pool');

function parseTime(t) {
  if (typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t)) return t;
  if (typeof t === 'string' && t.length >= 5) return t.substring(0, 5);
  return null;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Returns true if any reservation overlaps the given slot (for create/update validation). */
async function checkOverlap(client, specialistId, date, startTime, durationMinutes, excludeReservationId = null) {
  const startMin = timeToMinutes(parseTime(startTime));
  const endMin = startMin + durationMinutes;

  let overlapQuery = `
    SELECT id FROM reservations
    WHERE specialist_id = $1 AND date = $2
    AND (
      (EXTRACT(EPOCH FROM start_time)::bigint / 60) < $4
      AND (EXTRACT(EPOCH FROM start_time)::bigint / 60) + duration_minutes > $3
    )
  `;
  const params = [specialistId, date, startMin, endMin];

  if (excludeReservationId) {
    overlapQuery += ' AND id != $5';
    params.push(excludeReservationId);
  }

  const overlap = await client.query(overlapQuery, params);
  return overlap.rows.length > 0;
}

/** Fetch all reservations for a date with services joined; returns enriched objects. */
async function getDailySchedule(date) {
  if (!date) {
    const err = new Error('Date query parameter is required');
    err.status = 400;
    throw err;
  }

  const reservationsResult = await query(
    `SELECT r.id, r.specialist_id, r.date::text AS date, r.start_time, r.duration_minutes,
            s.first_name, s.last_name
     FROM reservations r
     JOIN staff s ON s.id = r.specialist_id
     WHERE r.date = $1
     ORDER BY r.specialist_id, r.start_time`,
    [date]
  );

  const reservationIds = reservationsResult.rows.map((r) => r.id);
  let servicesByReservation = {};
  if (reservationIds.length > 0) {
    const svcResult = await query(
      `SELECT rs.reservation_id, rs.service_id, rs.order_index, s.name as service_name, s.color
       FROM reservation_services rs
       JOIN services s ON s.id = rs.service_id
       WHERE rs.reservation_id = ANY($1)
       ORDER BY rs.reservation_id, rs.order_index`,
      [reservationIds]
    );
    for (const row of svcResult.rows) {
      if (!servicesByReservation[row.reservation_id]) {
        servicesByReservation[row.reservation_id] = [];
      }
      servicesByReservation[row.reservation_id].push({
        id: row.service_id,
        name: row.service_name,
        color: row.color,
        order_index: row.order_index,
      });
    }
  }

  const reservations = reservationsResult.rows.map((r) => {
    const raw = r.start_time;
    const startTime = (typeof raw === 'string' ? raw : raw?.toString?.() || '')?.substring(0, 5) || '00:00';
    const endMin = timeToMinutes(startTime) + r.duration_minutes;
    const endTime = minutesToTime(endMin);

    const services = (servicesByReservation[r.id] || []).sort((a, b) => a.order_index - b.order_index);
    const mainService = services[0];
    const additionalServices = services.slice(1);

    return {
      id: r.id,
      specialist_id: r.specialist_id,
      specialist_name: `${r.first_name} ${r.last_name}`,
      specialist_short_name: `${r.first_name || ''} ${(r.last_name?.charAt(0) || '').toUpperCase()}`.trim() || '?',
      date: r.date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: r.duration_minutes,
      services,
      main_service_name: mainService?.name || '',
      main_service_color: mainService?.color || '#999',
      additional_services: additionalServices.map((s) => s.name),
    };
  });

  return reservations;
}

async function createReservationWithChecks(body) {
  const { specialist_id, date, start_time, duration_minutes, service_ids = [] } = body;

  if (!specialist_id || !date || !start_time || duration_minutes == null) {
    const err = new Error('specialist_id, date, start_time, and duration_minutes are required');
    err.status = 400;
    throw err;
  }
  const duration = parseInt(duration_minutes, 10);
  if (isNaN(duration) || duration <= 0) {
    const err = new Error('duration_minutes must be a positive integer');
    err.status = 400;
    throw err;
  }
  const startTime = parseTime(start_time);
  if (!startTime) {
    const err = new Error('Invalid start_time format (HH:mm)');
    err.status = 400;
    throw err;
  }
  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    const err = new Error('At least one service is required');
    err.status = 400;
    throw err;
  }

  const reservation = await withTransaction(async (client) => {
    const hasOverlap = await checkOverlap(client, specialist_id, date, startTime, duration);
    if (hasOverlap) {
      const err = new Error('Reservation overlaps with an existing reservation for this specialist');
      err.status = 409;
      throw err;
    }

    const insertResult = await client.query(
      `INSERT INTO reservations (specialist_id, date, start_time, duration_minutes)
       VALUES ($1, $2, $3::time, $4)
       RETURNING id, specialist_id, date, start_time, duration_minutes`,
      [specialist_id, date, startTime, duration]
    );
    const res = insertResult.rows[0];

    for (let i = 0; i < service_ids.length; i++) {
      await client.query(
        `INSERT INTO reservation_services (reservation_id, service_id, order_index) VALUES ($1, $2, $3)`,
        [res.id, service_ids[i], i]
      );
    }

    return res;
  });

  const full = await getDailySchedule(date);
  return full.find((r) => r.id === reservation.id) || reservation;
}

async function updateReservationWithChecks(id, body) {
  const { specialist_id, date, start_time, duration_minutes, service_ids } = body;

  const existing = await query(
    'SELECT id, specialist_id, date, start_time, duration_minutes FROM reservations WHERE id = $1',
    [id]
  );
  if (existing.rows.length === 0) {
    const err = new Error('Reservation not found');
    err.status = 404;
    throw err;
  }
  const prev = existing.rows[0];

  const specialistId = specialist_id ?? prev.specialist_id;
  const resDate = date ?? prev.date;
  const startTime = start_time != null ? parseTime(start_time) : (typeof prev.start_time === 'string' ? prev.start_time : prev.start_time?.substring(0, 5));
  const duration = duration_minutes != null ? parseInt(duration_minutes, 10) : prev.duration_minutes;

  if (isNaN(duration) || duration <= 0) {
    const err = new Error('duration_minutes must be a positive integer');
    err.status = 400;
    throw err;
  }

  await withTransaction(async (client) => {
    const hasOverlap = await checkOverlap(client, specialistId, resDate, startTime, duration, id);
    if (hasOverlap) {
      const err = new Error('Reservation overlaps with an existing reservation for this specialist');
      err.status = 409;
      throw err;
    }

    await client.query(
      `UPDATE reservations SET specialist_id = $1, date = $2, start_time = $3::time, duration_minutes = $4, updated_at = NOW()
       WHERE id = $5`,
      [specialistId, resDate, startTime, duration, id]
    );

    if (Array.isArray(service_ids) && service_ids.length > 0) {
      await client.query('DELETE FROM reservation_services WHERE reservation_id = $1', [id]);
      for (let i = 0; i < service_ids.length; i++) {
        await client.query(
          `INSERT INTO reservation_services (reservation_id, service_id, order_index) VALUES ($1, $2, $3)`,
          [id, service_ids[i], i]
        );
      }
    }
  });

  const full = await getDailySchedule(resDate);
  return full.find((r) => r.id === parseInt(id, 10)) || { id, specialist_id: specialistId, date: resDate, start_time: startTime, duration_minutes: duration };
}

async function deleteReservation(id) {
  const result = await query('DELETE FROM reservations WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    const err = new Error('Reservation not found');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  getDailySchedule,
  createReservationWithChecks,
  updateReservationWithChecks,
  deleteReservation,
};
