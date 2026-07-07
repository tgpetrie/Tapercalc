import React from 'react';

export default function NextChangeCard({ schedule }) {
  const nextReduction = schedule?.find(item => item.dailyReduction > 0 && item.day > 1);
  const nextRestPoint = schedule?.find(item => item.status === 'hold');

  return (
    <section className="metric-card next-change-card">
      <span>Next</span>
      <strong>{nextReduction ? `Day ${nextReduction.day}` : 'Not plotted'}</strong>
      <small>
        {nextRestPoint ? `Next rest point: Day ${nextRestPoint.day}` : 'No rest point planned'}
      </small>
    </section>
  );
}
