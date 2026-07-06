import React from 'react';
import { formatNumber } from './utils/taperMath';

export default function SummaryPanel({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  const totalDays = schedule.length;
  const startingDose = schedule[0].totalDailyDose;
  const finalDose = schedule[schedule.length - 1].totalDailyDose;
  const totalReduction = startingDose - finalDose;
  const avgDailyReduction = totalReduction / totalDays;

  const holdDays = schedule.filter(item => item.status === 'hold').length;
  const taperingDays = schedule.filter(item => item.status === 'tapering').length;
  const targetDays = schedule.filter(item => item.status === 'target').length;

  const maxStep = schedule.reduce((max, item) => Math.max(max, item.step), 0);

  return (
    <div className="panel summary-panel">
      <h2 className="panel-title">Summary</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Total Duration</div>
          <div className="summary-value">{totalDays} days</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Steps</div>
          <div className="summary-value">{maxStep}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Starting Dose</div>
          <div className="summary-value">{formatNumber(startingDose)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Final Dose</div>
          <div className="summary-value">{formatNumber(finalDose)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Reduction</div>
          <div className="summary-value">{formatNumber(totalReduction)} mg</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Avg Daily Reduction</div>
          <div className="summary-value">{formatNumber(avgDailyReduction, 3)} mg</div>
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
