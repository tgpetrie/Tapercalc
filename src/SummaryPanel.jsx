import React from 'react';
import { formatNumber, STRATEGIES, FREQUENCIES, getIntervalDays } from './utils/taperEngine';
import { formatDisplayDate } from './utils/dateUtils';

export default function SummaryPanel({ schedule, inputs }) {
  if (!schedule || schedule.length === 0) return null;

  const totalDays = schedule.length;
  const startingDose = schedule[0].totalDailyDose;
  const finalDose = schedule[schedule.length - 1].totalDailyDose;
  const totalReduction = startingDose - finalDose;
  const percentComplete = startingDose > 0
    ? Math.min(100, ((startingDose - finalDose) / startingDose) * 100)
    : 0;

  const holdDays = schedule.filter(item => item.status === 'hold').length;
  const taperingDays = schedule.filter(item => item.status === 'tapering').length;
  const targetDays = schedule.filter(item => item.status === 'target').length;
  const maxStep = schedule.reduce((max, item) => Math.max(max, item.step), 0);

  // Estimated finish date
  let estFinishDate = '';
  if (inputs?.startDate && schedule.length > 0) {
    const lastDay = schedule[schedule.length - 1];
    estFinishDate = formatDisplayDate(lastDay.date);
  }

  // Strategy and frequency labels
  const strategyInfo = STRATEGIES[inputs?.strategy] || STRATEGIES.linear;
  const frequencyInfo = FREQUENCIES[inputs?.frequency] || FREQUENCIES.weekly;

  // Current daily reduction (from the last tapering day)
  const lastTaperingDay = [...schedule].reverse().find(item => item.status === 'tapering' && item.dailyReduction > 0);
  const currentDailyReduction = lastTaperingDay ? lastTaperingDay.dailyReduction : 0;

  // Monthly reduction estimate
  const intervalDays = getIntervalDays(inputs?.frequency, inputs?.customInterval);
  const reductionsPerMonth = 30 / intervalDays;
  let currentMonthlyReduction = 0;
  if (inputs?.strategy === 'fixedDaily') {
    currentMonthlyReduction = currentDailyReduction * 30;
  } else if (lastTaperingDay) {
    currentMonthlyReduction = currentDailyReduction * reductionsPerMonth * intervalDays;
  }

  return (
    <div className="panel summary-panel">
      <h2 className="panel-title">Summary</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Starting Dose</div>
          <div className="summary-value">{formatNumber(startingDose)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Current Dose</div>
          <div className="summary-value">{formatNumber(finalDose)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Target Dose</div>
          <div className="summary-value">{formatNumber(inputs?.targetDose || 0)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Reduction</div>
          <div className="summary-value">{formatNumber(totalReduction)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Percent Complete</div>
          <div className="summary-value">{formatNumber(percentComplete, 1)}%</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Est. Finish Date</div>
          <div className="summary-value summary-value-sm">{estFinishDate || 'N/A'}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Current Strategy</div>
          <div className="summary-value summary-value-sm">{strategyInfo.short}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Current Frequency</div>
          <div className="summary-value summary-value-sm">{frequencyInfo.label}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Daily Reduction</div>
          <div className="summary-value">{formatNumber(currentDailyReduction, 4)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Monthly Reduction</div>
          <div className="summary-value">{formatNumber(currentMonthlyReduction, 4)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Duration</div>
          <div className="summary-value">{totalDays} days</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Steps</div>
          <div className="summary-value">{maxStep}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Tapering Days</div>
          <div className="summary-value">{taperingDays}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Hold Days</div>
          <div className="summary-value">{holdDays}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Target Days</div>
          <div className="summary-value">{targetDays}</div>
        </div>
      </div>
    </div>
  );
}
