import React from 'react';
import { formatNumber } from '../utils/taperEngine';

export default function CalendarRouteView({ schedule }) {
  if (!schedule || schedule.length === 0) return null;
  const visibleDays = schedule.slice(0, 14);

  return (
    <section className="calendar-route compass-card">
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>Next route days</h2>
        </div>
      </div>
      <div className="calendar-day-grid">
        {visibleDays.map(day => (
          <article key={day.day} className={`calendar-day-card status-${day.status}`}>
            <span>{day.date || `Day ${day.day}`}</span>
            <strong>Day {day.day}</strong>
            <small>{formatNumber(day.totalDailyDose)} mg</small>
            {day.dailyReduction > 0 && <em>-{formatNumber(day.dailyReduction, 4)} mg</em>}
            {day.status === 'hold' && <em>Rest point</em>}
          </article>
        ))}
      </div>
    </section>
  );
}
