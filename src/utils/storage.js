/**
 * localStorage-based persistence for taper plans.
 * Plans are stored as JSON under a single key.
 */

const STORAGE_KEY = 'taper-calculator-plans';

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
  const id = `plan-${Date.now()}`;
  const plan = { id, name, data, savedAt: new Date().toISOString() };

  // Check if a plan with the same name exists — overwrite it
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
