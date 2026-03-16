/**
 * Date helpers for the schedule and reservation forms.
 */

/** Format date for HTML date input (YYYY-MM-DD) */
export function formatDateForInput(d) {
  if (!d) return '';
  if (typeof d === 'string') return d.substring(0, 10);
  if (d instanceof Date) return d.toISOString().substring(0, 10);
  return String(d).substring(0, 10);
}

/** Format date for display (e.g. "March 11, 2025") */
export function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
