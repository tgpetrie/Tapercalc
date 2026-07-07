import React from 'react';
import { FREQUENCIES, STRATEGIES, formatNumber } from '../utils/taperEngine';

export default function CurrentPositionCard({ currentTotal, targetDose, schedule, inputs }) {
  const strategy = STRATEGIES[inputs.strategy] || STRATEGIES.linear;
  const frequency = FREQUENCIES[inputs.frequency] || FREQUENCIES.weekly;

  return (
    <section className="current-position-card compass-card">
      <div>
        <p className="eyebrow">Current Position</p>
        <strong className="position-dose">{formatNumber(currentTotal)} mg</strong>
      </div>
      <div className="position-grid">
        <div>
          <span>Strategy</span>
          <strong>{strategy.short}</strong>
        </div>
        <div>
          <span>Frequency</span>
          <strong>{frequency.label}</strong>
        </div>
        <div>
          <span>Started</span>
          <strong>{schedule?.[0] ? `${formatNumber(schedule[0].totalDailyDose)} mg` : 'Not plotted'}</strong>
        </div>
        <div>
          <span>Destination</span>
          <strong>{formatNumber(targetDose)} mg</strong>
        </div>
      </div>
    </section>
  );
}
