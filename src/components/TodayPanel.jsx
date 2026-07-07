import React from 'react';
import { formatNumber, totalDailyDose } from '../utils/taperEngine';

export default function TodayPanel({ inputs, schedule, todayCheckIn, onContinue }) {
  const todayRoute = schedule?.[0] || null;
  const sourceDoses = todayRoute?.doses || inputs.doses;
  const total = totalDailyDose(sourceDoses);

  return (
    <section className="today-panel compass-card">
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Today</p>
          <h2>{todayCheckIn ? 'Check-in saved' : `${formatNumber(total)} mg scheduled`}</h2>
        </div>
        <button type="button" className="btn-primary" onClick={onContinue}>
          Continue Journey
        </button>
      </div>
      <div className="today-dose-list">
        {sourceDoses.map((dose, index) => {
          const logged = todayCheckIn?.doseLogs?.find(log => log.doseId === dose.id);
          return (
            <div key={dose.id || index} className="today-dose-row">
              <span>{dose.label || `Dose ${index + 1}`}</span>
              <strong>{logged?.status || 'pending'}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
