import React from 'react';

function daysSince(dateStr) {
  if (!dateStr) return null;
  const start = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((todayStart - start) / 86400000));
}

export default function JourneyRecordCard({ continuity, todayCheckIn }) {
  const elapsed = daysSince(continuity.lastCheckInDate);
  const lastText = !continuity.lastCheckInDate
    ? 'No check-ins yet'
    : elapsed === 0
      ? 'Today'
      : `${elapsed} days ago`;

  return (
    <section className="journey-record-card compass-card">
      <span className="card-label">Journey Record</span>
      <strong>{continuity.daysLogged}</strong>
      <small>{todayCheckIn ? 'Today logged' : `Last check-in: ${lastText}`}</small>
    </section>
  );
}
