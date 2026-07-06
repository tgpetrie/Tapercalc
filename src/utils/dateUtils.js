/**
 * Date utility functions for taper schedule calendar display.
 */

/**
 * Format a date as YYYY-MM-DD.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Get the weekday short name (Mon, Tue, etc.).
 * @param {Date} date
 * @returns {string}
 */
export function getWeekday(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get the full weekday name (Monday, Tuesday, etc.).
 * @param {Date} date
 * @returns {string}
 */
export function getWeekdayFull(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Compute the date for a given day number (1-indexed) from a start date.
 * @param {string} startDateStr - ISO date string
 * @param {number} day - 1-indexed day number
 * @returns {{ date: string, weekday: string }}
 */
export function getDateForDay(startDateStr, day) {
  if (!startDateStr) return { date: '', weekday: '' };
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return { date: '', weekday: '' };
  const d = new Date(start);
  d.setDate(start.getDate() + day - 1);
  return { date: formatDate(d), weekday: getWeekday(d) };
}

/**
 * Format a date for display in a readable format (e.g. "Jan 15, 2026").
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
