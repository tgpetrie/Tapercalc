/**
 * Taper calculation utilities for medication dose reduction schedules.
 * Supports multi-dose daily schedules, hold periods, cut distribution strategies,
 * and both linear and percentage taper modes.
 *
 * Percentage taper recalculates every 30 days based on the current dose
 * at the start of that 30-day block (monthly recalculation).
 * Linear taper uses the original starting dose for every step.
 */

const DAYS_PER_MONTH = 30;
const EPSILON = 1e-6;

/**
 * Calculate the total daily dose in mg from a doses array.
 * Each dose contributes tabletMg + (liquidMl * mgPerMl).
 * @param {Array} doses - Array of dose objects { tabletMg, liquidMl, mgPerMl, label }
 * @returns {number} Total daily dose in mg
 */
export function totalDailyDose(doses) {
  return doses.reduce((sum, d) => {
    const tablet = parseFloat(d.tabletMg) || 0;
    const liquid = (parseFloat(d.liquidMl) || 0) * (parseFloat(d.mgPerMl) || 0);
    return sum + tablet + liquid;
  }, 0);
}

/**
 * Deep-clone a doses array with parsed numeric values.
 */
function cloneDoses(doses) {
  return doses.map(d => ({
    ...d,
    tabletMg: parseFloat(d.tabletMg) || 0,
    liquidMl: parseFloat(d.liquidMl) || 0,
    mgPerMl: parseFloat(d.mgPerMl) || 0,
  }));
}

/**
 * Get the order in which doses should be cut, based on the distribution strategy.
 * Returns an array of indices into the doses array.
 * @param {Array} doses - Doses array
 * @param {string} strategy - 'alternate' | 'firstFirst' | 'lastFirst' | 'splitEvenly' | 'custom'
 * @param {Array} customOrder - Array of indices for custom priority (highest priority first)
 * @returns {Array} Array of dose indices in cut priority order
 */
export function getCutOrder(doses, strategy, customOrder = []) {
  const indices = doses.map((_, i) => i);

  switch (strategy) {
    case 'firstFirst':
      return [...indices];
    case 'lastFirst':
      return [...indices].reverse();
    case 'splitEvenly':
      return [...indices];
    case 'custom':
      return customOrder.length === indices.length
        ? [...customOrder]
        : [...indices];
    case 'alternate':
    default:
      return [...indices];
  }
}

/**
 * Distribute a daily reduction amount across doses according to the cut strategy.
 * Returns a new doses array with reduced values.
 *
 * @param {Array} doses - Current doses (will not be mutated)
 * @param {number} reductionMg - Total mg to reduce for this day
 * @param {string} strategy - Cut distribution strategy
 * @param {Array} customOrder - Custom priority order (indices)
 * @returns {Array} New doses array with reduction applied
 */
export function applyDailyReduction(doses, reductionMg, strategy, customOrder = []) {
  const newDoses = cloneDoses(doses);
  if (reductionMg <= 0) return newDoses;

  if (strategy === 'splitEvenly') {
    const perDose = reductionMg / newDoses.length;
    for (const d of newDoses) {
      reduceDose(d, perDose);
    }
    return newDoses;
  }

  const order = getCutOrder(doses, strategy, customOrder);
  let remaining = reductionMg;

  for (const idx of order) {
    if (remaining <= 0) break;
    const d = newDoses[idx];
    const available = doseAvailableMg(d);
    if (available <= 0) continue;
    const cut = Math.min(remaining, available);
    reduceDose(d, cut);
    remaining -= cut;
  }

  return newDoses;
}

/**
 * Get the total reducible mg from a single dose (tablet + liquid mg).
 */
function doseAvailableMg(d) {
  return (d.tabletMg || 0) + (d.liquidMl || 0) * (d.mgPerMl || 0);
}

/**
 * Reduce a single dose by a given mg amount.
 * First cuts liquid (mL), then tablet mg. Mutates the dose object.
 */
function reduceDose(d, amount) {
  let remaining = amount;

  const liquidMg = (d.liquidMl || 0) * (d.mgPerMl || 0);
  if (liquidMg > 0 && remaining > 0) {
    const cutMg = Math.min(remaining, liquidMg);
    const cutMl = d.mgPerMl > 0 ? cutMg / d.mgPerMl : 0;
    d.liquidMl = Math.max(0, d.liquidMl - cutMl);
    remaining -= cutMg;
  }

  if (d.tabletMg > 0 && remaining > 0) {
    const cutMg = Math.min(remaining, d.tabletMg);
    d.tabletMg = Math.max(0, d.tabletMg - cutMg);
    remaining -= cutMg;
  }
}

/**
 * Check if a given day falls within any hold period.
 * @param {number} day - 1-indexed day number
 * @param {Array} holds - Array of { startDay, lengthDays, reason }
 * @returns {Object|null} The matching hold or null
 */
export function getHoldForDay(day, holds) {
  if (!holds || holds.length === 0) return null;
  for (const h of holds) {
    const start = parseInt(h.startDay, 10);
    const len = parseInt(h.lengthDays, 10);
    if (!isNaN(start) && !isNaN(len) && day >= start && day < start + len) {
      return h;
    }
  }
  return null;
}

/**
 * Compute the step target total based on taper type.
 *
 * For percentage taper: recalculates from currentTotal each step,
 * so each 30-day block uses the dose at the start of that block.
 * For linear taper: subtracts a fixed amount from currentTotal.
 */
function computeStepTarget(currentTotal, targetDose, taperType, reductionAmount, reductionPercent) {
  if (taperType === 'percentage') {
    const pct = parseFloat(reductionPercent) || 0;
    return Math.max(targetDose, currentTotal * (1 - pct / 100));
  }
  const amt = parseFloat(reductionAmount) || 0;
  return Math.max(targetDose, currentTotal - amt);
}

/**
 * Generate a per-day taper schedule.
 *
 * Percentage taper mode recalculates every 30 days based on the current
 * dose at the start of that 30-day block. Linear mode uses the original
 * starting dose for every step.
 *
 * @param {Object} params
 * @param {Array} params.doses - Initial doses array
 * @param {number} params.targetDose - Target total daily dose in mg
 * @param {string} params.taperType - 'linear' | 'percentage'
 * @param {number} params.reductionAmount - mg per step (linear)
 * @param {number} params.reductionPercent - percent per step (percentage)
 * @param {number} params.stepDuration - days per step
 * @param {string} params.cutStrategy - 'alternate' | 'firstFirst' | 'lastFirst' | 'splitEvenly' | 'custom'
 * @param {Array} params.customOrder - custom priority order (indices)
 * @param {Array} params.holds - hold periods
 * @param {string} params.startDate - ISO date string or ''
 * @param {number} params.maxDays - safety cap on total days (default 730)
 * @returns {Array} Array of per-day schedule objects
 */
export function generateSchedule({
  doses,
  targetDose,
  taperType,
  reductionAmount,
  reductionPercent,
  stepDuration,
  cutStrategy,
  customOrder = [],
  holds = [],
  startDate = '',
  maxDays = 730,
}) {
  const schedule = [];
  let currentDoses = cloneDoses(doses);
  let currentTotal = totalDailyDose(currentDoses);
  const parsedTarget = parseFloat(targetDose) || 0;
  const parsedStepDuration = Math.max(1, parseInt(stepDuration, 10) || 1);

  let stepNumber = 1;
  let dayInStep = 0;
  let stepStartTotal = currentTotal;
  let stepTargetTotal = computeStepTarget(currentTotal, parsedTarget, taperType, reductionAmount, reductionPercent);
  let reachedTarget = false;

  // Track tapering days (excluding holds) for monthly recalculation
  let taperingDayCount = 0;
  let monthStartTotal = currentTotal;

  for (let day = 1; day <= maxDays; day++) {
    const hold = getHoldForDay(day, holds);
    const isHold = hold !== null;

    let dayDoses;
    let dailyReduction = 0;
    let status = 'tapering';
    let note = '';

    if (isHold) {
      dayDoses = cloneDoses(schedule.length > 0 ? schedule[schedule.length - 1].doses : currentDoses);
      status = 'hold';
      note = hold.reason || `Hold period (${hold.lengthDays} days)`;
    } else {
      // Check if we need to recalculate for percentage mode (every 30 tapering days)
      if (taperType === 'percentage' && taperingDayCount > 0 && taperingDayCount % DAYS_PER_MONTH === 0) {
        monthStartTotal = currentTotal;
      }

      if (dayInStep === 0) {
        stepStartTotal = currentTotal;
        // For percentage mode, use monthStartTotal as the base for recalculation
        const baseTotal = taperType === 'percentage' ? monthStartTotal : currentTotal;
        stepTargetTotal = computeStepTarget(baseTotal, parsedTarget, taperType, reductionAmount, reductionPercent);
      }

      const stepTotalReduction = stepStartTotal - stepTargetTotal;
      const stepDailyReduction = stepTotalReduction / parsedStepDuration;

      if (stepDailyReduction > 0 && currentTotal > parsedTarget + EPSILON) {
        dayDoses = applyDailyReduction(currentDoses, stepDailyReduction, cutStrategy, customOrder);
        dailyReduction = currentTotal - totalDailyDose(dayDoses);
        currentDoses = dayDoses;
        currentTotal = totalDailyDose(currentDoses);
      } else {
        dayDoses = cloneDoses(currentDoses);
        dailyReduction = 0;
      }

      dayInStep++;
      taperingDayCount++;

      if (dayInStep >= parsedStepDuration) {
        stepNumber++;
        dayInStep = 0;
      }

      if (currentTotal <= parsedTarget + EPSILON) {
        currentTotal = parsedTarget;
        status = 'target';
        note = 'Target dose reached';
        reachedTarget = true;
      }
    }

    let dateStr = '';
    let weekdayStr = '';
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + day - 1);
        dateStr = dayDate.toISOString().split('T')[0];
        weekdayStr = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
      }
    }

    schedule.push({
      day,
      date: dateStr,
      weekday: weekdayStr,
      step: stepNumber,
      doses: dayDoses,
      totalDailyDose: totalDailyDose(dayDoses),
      dailyReduction,
      status,
      note,
    });

    if (reachedTarget && !isHold) {
      const finalDays = Math.min(parsedStepDuration, 7);
      for (let fd = 1; fd <= finalDays; fd++) {
        const fDoses = cloneDoses(currentDoses);
        let fDate = '';
        let fWeekday = '';
        if (startDate) {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            const d = new Date(start);
            d.setDate(start.getDate() + day + fd - 1);
            fDate = d.toISOString().split('T')[0];
            fWeekday = d.toLocaleDateString('en-US', { weekday: 'short' });
          }
        }
        schedule.push({
          day: day + fd,
          date: fDate,
          weekday: fWeekday,
          step: stepNumber,
          doses: fDoses,
          totalDailyDose: parsedTarget,
          dailyReduction: 0,
          status: 'target',
          note: 'Target dose reached',
        });
      }
      break;
    }
  }

  return schedule;
}

/**
 * Format a number for display with appropriate decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num.toFixed(decimals)).toString();
}

/**
 * Download schedule as CSV file
 * @param {Array} schedule - Schedule array from calculation
 * @param {Array} doseLabels - Labels for each dose column
 * @param {string} filename - Name for the downloaded file
 */
export function downloadAsCSV(schedule, doseLabels, filename = 'taper-schedule.csv') {
  const doseHeaders = [];
  doseLabels.forEach((label) => {
    doseHeaders.push(`${label} Tablet (mg)`, `${label} Liquid (mL)`, `${label} Liquid (mg)`);
  });

  const headers = ['Day', 'Date', 'Weekday', 'Step', ...doseHeaders, 'Total Daily (mg)', 'Daily Reduction (mg)', 'Status', 'Notes'];

  const rows = schedule.map(item => {
    const doseCells = [];
    item.doses.forEach(d => {
      const liquidMg = (d.liquidMl || 0) * (d.mgPerMl || 0);
      doseCells.push(formatNumber(d.tabletMg), formatNumber(d.liquidMl), formatNumber(liquidMg));
    });
    return [
      item.day,
      item.date || '',
      item.weekday || '',
      item.step,
      ...doseCells,
      formatNumber(item.totalDailyDose),
      formatNumber(item.dailyReduction, 4),
      item.status,
      item.note || '',
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Validate inputs and return an array of warning messages.
 * @param {Object} inputs - The current inputs state
 * @returns {Array} Array of warning strings (empty if no warnings)
 */
export function validateInputs(inputs) {
  const warnings = [];
  const { doses, holds, targetDose, taperType, reductionAmount, reductionPercent } = inputs;

  // No doses entered
  const hasDoses = doses.length > 0 && doses.some(d =>
    (parseFloat(d.tabletMg) > 0) || (parseFloat(d.liquidMl) > 0)
  );
  if (!hasDoses) {
    warnings.push('No doses entered. Add at least one dose with tablet mg or liquid mL greater than 0.');
  }

  // Invalid liquid concentration
  doses.forEach((d, i) => {
    const mgPerMl = parseFloat(d.mgPerMl);
    const liquidMl = parseFloat(d.liquidMl);
    if (liquidMl > 0 && (isNaN(mgPerMl) || mgPerMl <= 0)) {
      warnings.push(`Dose "${d.label || `Dose ${i + 1}`}" has liquid mL but invalid concentration (mg/mL must be greater than 0).`);
    }
  });

  // Total daily dose below target
  const startTotal = totalDailyDose(doses);
  const parsedTarget = parseFloat(targetDose);
  if (!isNaN(parsedTarget) && startTotal > 0 && parsedTarget >= startTotal) {
    warnings.push('Target dose is greater than or equal to the current total daily dose. No tapering will occur.');
  }

  // Hold starts before Day 1
  holds.forEach((h, i) => {
    const start = parseInt(h.startDay, 10);
    if (!isNaN(start) && start < 1) {
      warnings.push(`Hold #${i + 1} starts before Day 1. Hold start days must be 1 or later.`);
    }
  });

  // Hold overlaps another hold
  for (let i = 0; i < holds.length; i++) {
    for (let j = i + 1; j < holds.length; j++) {
      const a = holds[i];
      const b = holds[j];
      const aStart = parseInt(a.startDay, 10);
      const aLen = parseInt(a.lengthDays, 10);
      const bStart = parseInt(b.startDay, 10);
      const bLen = parseInt(b.lengthDays, 10);
      if (isNaN(aStart) || isNaN(aLen) || isNaN(bStart) || isNaN(bLen)) continue;
      const aEnd = aStart + aLen - 1;
      const bEnd = bStart + bLen - 1;
      if (aStart <= bEnd && bStart <= aEnd) {
        warnings.push(`Hold #${i + 1} and Hold #${j + 1} overlap. Please adjust the start days or lengths.`);
        break;
      }
    }
  }

  return warnings;
}
