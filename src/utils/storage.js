/**
 * localStorage-based persistence for taper plans.
 * Plans are stored as JSON under a single key.
 */

const STORAGE_KEY = 'taper-calculator-plans';
const CHECKINS_KEY = 'compass-daily-checkins';

/**
 * Get all saved plans from localStorage.
 * @returns {Array} Array of { id, name, data, savedAt } objects
 */
export function getSavedPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a plan to localStorage. If a plan with the same name exists, it is overwritten.
 * @param {string} name - Plan name
 * @param {Object} data - The inputs/state to save
 * @returns {Object} The saved plan object
 */
export function savePlan(name, data) {
  const plans = getSavedPlans();
  const id = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const plan = { id, name, data, savedAt: new Date().toISOString() };

  const existingIdx = plans.findIndex(p => p.name === name);
  if (existingIdx >= 0) {
    plan.id = plans[existingIdx].id;
    plans[existingIdx] = plan;
  } else {
    plans.push(plan);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plan;
}

/**
 * Delete a plan by id.
 * @param {string} id - Plan id to delete
 */
export function deletePlan(id) {
  const plans = getSavedPlans();
  const filtered = plans.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Load a plan by id.
 * @param {string} id - Plan id to load
 * @returns {Object|null} The plan data or null if not found
 */
export function loadPlan(id) {
  const plans = getSavedPlans();
  const plan = plans.find(p => p.id === id);
  return plan ? plan.data : null;
}

/**
 * Rename a plan by id.
 * @param {string} id - Plan id to rename
 * @param {string} newName - New plan name
 * @returns {Object|null} The updated plan or null if not found
 */
export function renamePlan(id, newName) {
  const plans = getSavedPlans();
  const plan = plans.find(p => p.id === id);
  if (!plan) return null;
  plan.name = newName;
  plan.savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plan;
}

/**
 * Duplicate a plan by id, creating a copy with a new name.
 * @param {string} id - Plan id to duplicate
 * @param {string} newName - Name for the duplicated plan
 * @returns {Object|null} The duplicated plan or null if original not found
 */
export function duplicatePlan(id, newName) {
  const plans = getSavedPlans();
  const original = plans.find(p => p.id === id);
  if (!original) return null;
  const newPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: newName,
    data: JSON.parse(JSON.stringify(original.data)),
    savedAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return newPlan;
}

export function getCheckIns() {
  try {
    const raw = localStorage.getItem(CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCheckInForDate(date) {
  return getCheckIns().find(checkIn => checkIn.date === date) || null;
}

export function saveCheckIn(data) {
  const checkIns = getCheckIns();
  const existingIndex = checkIns.findIndex(checkIn => checkIn.date === data.date);
  const checkIn = {
    id: data.id || `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    completedAt: data.completedAt || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    checkIns[existingIndex] = checkIn;
  } else {
    checkIns.push(checkIn);
  }

  checkIns.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
  return checkIn;
}

export function getContinuity() {
  const checkIns = getCheckIns();
  const checkInsByDate = checkIns.reduce((acc, checkIn) => {
    acc[checkIn.date] = checkIn;
    return acc;
  }, {});

  const lastCheckIn = checkIns[checkIns.length - 1] || null;
  return {
    daysLogged: checkIns.length,
    lastCheckInDate: lastCheckIn?.date || '',
    currentRhythm: checkIns.length > 0 ? 'active' : 'not_started',
    checkInsByDate,
  };
}
