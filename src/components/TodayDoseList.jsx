import React from 'react';
import { formatNumber, totalDailyDose } from '../utils/taperEngine';
import ContinueJourneyButton from './ContinueJourneyButton';

function doseAmount(dose) {
  return (parseFloat(dose.tabletMg) || 0) + (parseFloat(dose.liquidMl) || 0) * (parseFloat(dose.mgPerMl) || 0);
}

export default function TodayDoseList({ inputs, schedule, todayCheckIn, onContinue }) {
  const todayRoute = schedule?.[0] || null;
  const sourceDoses = todayRoute?.doses || inputs.doses;
  const total = totalDailyDose(sourceDoses);

  return (
    <section className="today-dose-card compass-card">
      <div className="today-dose-card-header">
        <div>
          <span className="card-label">Today's Doses</span>
          <strong>{formatNumber(total)} mg scheduled</strong>
        </div>
        {todayCheckIn && <span className="logged-pill">Logged</span>}
      </div>
      <div className="today-dose-list compact">
        {sourceDoses.map((dose, index) => {
          const logged = todayCheckIn?.doseLogs?.find(log => log.doseId === dose.id);
          const status = logged?.status || 'pending';
          return (
            <div key={dose.id || index} className="today-dose-row">
              <div>
                <span>{dose.label || `Dose ${index + 1}`}</span>
                <small>{formatNumber(doseAmount(dose))} mg</small>
              </div>
              <strong>{status}</strong>
            </div>
          );
        })}
      </div>
      <ContinueJourneyButton onClick={onContinue} logged={Boolean(todayCheckIn)} />
    </section>
  );
}
