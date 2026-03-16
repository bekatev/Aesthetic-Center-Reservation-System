/**
 * Schedule time utilities.
 * Business hours: 8:00–20:00, with 5‑minute slots for time selection.
 */

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_INTERVAL = 5;

/** Convert "HH:mm" string to minutes since midnight (e.g. "09:30" → 570). */
export function timeToMinutes(t) {
  const [h, m] = (t || '').split(':').map(Number);
  return h * 60 + m;
}

/** Normalize time to "HH:mm" for display. */
export function formatTimeHHMM(t) {
  if (!t) return '';
  const s = typeof t === 'string' ? t : t.toString?.() || '';
  return s.substring(0, 5);
}

/** Hour labels for grid display (e.g. ["08:00", "09:00", ...]) */
export function getDisplayHours() {
  const hours = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}

/** 5-minute time slots for selection (e.g. ["08:00", "08:05", ...]) */
export function getTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}
