/**
 * Taper Engine — generic, flexible medication taper calculation engine.
 *
 * Strategies:
 *   linear       — fixed mg reduction per interval
 *   hyperbolic   — % of CURRENT dose per interval (each cut gets smaller)
 *   originalPct  — % of ORIGINAL starting dose per interval (each cut is same size)
 *   fixedDaily   — fixed mg reduction every single day
 *   custom       — reserved for future expansion
 *
 * Reduction Frequency (independent of strategy):
 *   daily, weekly, biweekly, monthly(30d), custom(N days)
 *
 * Architecture is modular so future modules (symptom tracker, charts, etc.)
 * can consume the schedule output without touching the engine.
 */

export const EPSILON = 1e-6;

export const STRATEGIES = {
  linear: {
    id: 'linear',
    label: 'Linear / Fixed Amount',
    short: 'Linear',
    description: 'Reduce by a fixed amount of mg at each interval. Example: reduce 0.5mg every week.',
    needsAmount: true,
    needsPercent: false,
  },
  hyperbolic: {
    id: 'hyperbolic',
    label: 'Percentage of Current Dose (Hyperbolic)',
    short: 'Hyperbolic',
    description: 'Each reduction is calculated from the current dose, so each cut becomes slightly smaller over time. Example: reduce 2% of current dose every interval.',
    needsAmount: false,
    needsPercent: true,
  },
  originalPct: {
    id: 'originalPct',
    label: 'Percentage of Original Dose',
    short: 'Original %',
    description: 'Each reduction is a percentage of the original starting dose, so every cut is the same size. Example: reduce 2% of the original dose every interval.',
    needsAmount: false,
    needsPercent: true,
  },
  fixedDaily: {
    id: 'fixedDaily',
    label: 'Fixed Daily Reduction',
    short: 'Fixed Daily',
    description: 'Reduce by exactly the same amount of mg every single day. Example: reduce 0.02mg every day.',
    needsAmount: true,
    needsPercent: false,
  },
  custom: {
    id: 'custom',
    label: 'Custom Formula (Coming Soon)',
    short: 'Custom',
    description: 'Reserved for future expansion with custom reduction formulas.',
    needsAmount: false,
    needsPercent: false,
    disabled: true,
  },
};

export const FREQUENCIES = {
  daily: { id: 'daily', label: 'Daily (Microtaper)', days: 1 },
  weekly: { id: 'weekly', label: 'Weekly', days: 7 },
  biweekly: { id: 'biweekly', label: 'Every 2 Weeks', days: 14 },
  fourWeeks: { id: 'fourWeeks', label: 'Every 4 Weeks', days: 28 },
  monthly: { id: 'monthly', label: 'Monthly', days: 30 },
  custom: { id: 'custom', label: 'Custom Interval', days: 0 },
};

/**
 * Get the interval in days for a given frequency.
 */
export function getIntervalDays(frequency, customInterval) {
  const freq = FREQUENCIES[frequency];
  if (!freq) return 7;
  if (frequency === 'custom') {
    return Math.max(1, parseInt(customInterval, 10) || 1);
  }
  return freq.days;
}

/**
 * Calculate the total daily dose in mg from a doses array.
 */
export function totalDailyDose(doses) {
  return doses.reduce((sum, d) => {
    const tablet = parseFloat(d.tabletMg) || 0;
    const liquid = (parseFloat(d.liquidMl) || 0) * (parseFloat(d.mgPerMl) || 0);
    return sum + tablet + liquid;
  }, 0);
}

function cloneDoses(doses) {
  return doses.map(d => ({
    ...d,
    tabletMg: parseFloat(d.tabletMg) || 0,
    liquidMl: parseFloat(d.liquidMl) || 0,
    mgPerMl: parseFloat(d.mgPerMl) || 0,
  }));
}

/**
 * Compute the reduction amount (in mg) for a single interval.
 *
 * @param {string} strategy - Strategy id
 * @param {number} currentTotal - Current total daily dose in mg
 * @param {number} originalTotal - Original starting total daily dose in mg
 * @param {number} reductionAmount - mg per interval (linear/fixedDaily)
 * @param {number} reductionPercent - percent per interval (hyperbolic/originalPct)
 * @returns {number} Reduction in mg for this interval
 */
export function computeIntervalReduction(strategy, currentTotal, originalTotal, reductionAmount, reductionPercent) {
  const amt = parseFloat(reductionAmount) || 0;
  const pct = parseFloat(reductionPercent) || 0;

  switch (strategy) {
    case 'linear':
      return amt;
    case 'hyperbolic':
      return currentTotal * (pct / 100);
    case 'originalPct':
      return originalTotal * (pct / 100);
    case 'fixedDaily':
      return amt;
    case 'custom':
    default:
      return 0;
  }
}

// ===== Cut Distribution =====

export function getCutOrder(doses, strategy, customOrder = []) {
  const indices = doses.map((_, i) => i);
  switch (strategy) {
    case 'firstFirst': return [...indices];
    case 'lastFirst': return [...indices].reverse();
    case 'splitEvenly': return [...indices];
    case 'custom':
      return customOrder.length === indices.length ? [...customOrder] : [...indices];
    case 'alternate':
    default: return [...indices];
  }
}

function doseAvailableMg(d) {
  return (d.tabletMg || 0) + (d.liquidMl || 0) * (d.mgPerMl || 0);
}

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

export function applyReduction(doses, reductionMg, cutStrategy, customOrder = []) {
  const newDoses = cloneDoses(doses);
  if (reductionMg <= 0) return newDoses;

  if (cutStrategy === 'splitEvenly') {
    const perDose = reductionMg / newDoses.length;
    for (const d of newDoses) reduceDose(d, perDose);
    return newDoses;
  }

  const order = getCutOrder(doses, cutStrategy, customOrder);
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

// ===== Holds =====

export function getHoldForDay(day, holds) {
  if (!holds || holds.length === 0) return null;
  for (const h of holds) {
    const start = parseInt(h.startDay, 10);
    const len = parseInt(h.lengthDays, 10);
    if (!isNaN(start) && !isNaN(len) && day >= start && day < start + len) return h;
  }
  return null;
}

// ===== Schedule Generation =====

/**
 * Generate a per-day taper schedule.
 *
 * @param {Object} params
 * @param {Array} params.doses - Initial doses array
 * @param {number} params.targetDose - Target total daily dose in mg
 * @param {string} params.strategy - Strategy id (linear, hyperbolic, originalPct, fixedDaily)
 * @param {string} params.frequency - Frequency id (daily, weekly, biweekly, fourWeeks, monthly, custom)
 * @param {number} params.customInterval - Custom interval in days (when frequency === 'custom')
 * @param {number} params.reductionAmount - mg per interval (linear/fixedDaily)
 * @param {number} params.reductionPercent - percent per interval (hyperbolic/originalPct)
 * @param {string} params.cutStrategy - Cut distribution strategy
 * @param {Array} params.customOrder - Custom priority order (indices)
 * @param {Array} params.holds - Hold periods
 * @param {string} params.startDate - ISO date string or ''
 * @param {number} params.maxDays - Safety cap (default 1095)
 * @returns {Array} Array of per-day schedule objects
 */
export function generateSchedule({
  doses,
  targetDose,
  strategy,
  frequency,
  customInterval,
  reductionAmount,
  reductionPercent,
  cutStrategy,
  customOrder = [],
  holds = [],
  startDate = '',
  maxDays = 1095,
}) {
  const schedule = [];
  let currentDoses = cloneDoses(doses);
  let currentTotal = totalDailyDose(currentDoses);
  const originalTotal = currentTotal;
  const parsedTarget = parseFloat(targetDose) || 0;
  const intervalDays = getIntervalDays(frequency, customInterval);

  let stepNumber = 1;
  let dayInInterval = 0;
  let intervalReduction = computeIntervalReduction(strategy, currentTotal, originalTotal, reductionAmount, reductionPercent);
  let reachedTarget = false;

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
      // fixedDaily strategy reduces every day regardless of frequency
      if (strategy === 'fixedDaily') {
        if (currentTotal > parsedTarget + EPSILON) {
          const dailyAmt = computeIntervalReduction(strategy, currentTotal, originalTotal, reductionAmount, reductionPercent);
          dayDoses = applyReduction(currentDoses, dailyAmt, cutStrategy, customOrder);
          dailyReduction = currentTotal - totalDailyDose(dayDoses);
          currentDoses = dayDoses;
          currentTotal = totalDailyDose(currentDoses);
        } else {
          dayDoses = cloneDoses(currentDoses);
        }
        dayInInterval++;
        if (dayInInterval >= intervalDays) {
          stepNumber++;
          dayInInterval = 0;
        }
      } else {
        // Stepwise: reduce at the start of each interval, hold dose for rest of interval
        if (dayInInterval === 0) {
          // Start of new interval — compute and apply reduction
          intervalReduction = computeIntervalReduction(strategy, currentTotal, originalTotal, reductionAmount, reductionPercent);
          if (intervalReduction > 0 && currentTotal > parsedTarget + EPSILON) {
            dayDoses = applyReduction(currentDoses, intervalReduction, cutStrategy, customOrder);
            dailyReduction = currentTotal - totalDailyDose(dayDoses);
            currentDoses = dayDoses;
            currentTotal = totalDailyDose(currentDoses);
          } else {
            dayDoses = cloneDoses(currentDoses);
          }
        } else {
          dayDoses = cloneDoses(currentDoses);
        }

        dayInInterval++;
        if (dayInInterval >= intervalDays) {
          stepNumber++;
          dayInInterval = 0;
        }
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
      const finalDays = Math.min(intervalDays, 7);
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

// ===== Formatting & Export =====

export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num.toFixed(decimals)).toString();
}

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

// ===== Validation =====

export function validateInputs(inputs) {
  const warnings = [];
  const { doses, holds, targetDose } = inputs;

  const hasDoses = doses.length > 0 && doses.some(d =>
    (parseFloat(d.tabletMg) > 0) || (parseFloat(d.liquidMl) > 0)
  );
  if (!hasDoses) {
    warnings.push('No doses entered. Add at least one dose with tablet mg or liquid mL greater than 0.');
  }

  doses.forEach((d, i) => {
    const mgPerMl = parseFloat(d.mgPerMl);
    const liquidMl = parseFloat(d.liquidMl);
    if (liquidMl > 0 && (isNaN(mgPerMl) || mgPerMl <= 0)) {
      warnings.push(`Dose "${d.label || `Dose ${i + 1}`}" has liquid mL but invalid concentration (mg/mL must be greater than 0).`);
    }
  });

  const startTotal = totalDailyDose(doses);
  const parsedTarget = parseFloat(targetDose);
  if (!isNaN(parsedTarget) && startTotal > 0 && parsedTarget >= startTotal) {
    warnings.push('Target dose is greater than or equal to the current total daily dose. No tapering will occur.');
  }

  holds.forEach((h, i) => {
    const start = parseInt(h.startDay, 10);
    if (!isNaN(start) && start < 1) {
      warnings.push(`Hold #${i + 1} starts before Day 1. Hold start days must be 1 or later.`);
    }
  });

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
