import React from 'react';
import { formatNumber } from '../utils/taperEngine';

function completionText(schedule) {
  if (!schedule || schedule.length === 0) return 'Not plotted';
  const final = schedule[schedule.length - 1];
  return final.date ? final.date : `Day ${final.day}`;
}

export default function JourneyStoryCard({ beginningDose, currentPosition, destinationDose, schedule, routeDay = 1 }) {
  return (
    <section className="journey-story-card compass-card">
      <div className="story-header">
        <span className="card-label">Journey Story</span>
        <strong>Day {routeDay}</strong>
      </div>
      <div className="story-route">
        <div>
          <span>Beginning</span>
          <strong>{formatNumber(beginningDose)} mg</strong>
        </div>
        <i aria-hidden="true" />
        <div>
          <span>Current Position</span>
          <strong>{formatNumber(currentPosition)} mg</strong>
        </div>
        <i aria-hidden="true" />
        <div>
          <span>Destination</span>
          <strong>{formatNumber(destinationDose)} mg</strong>
        </div>
      </div>
      <div className="story-completion">
        <span>Estimated completion</span>
        <strong>{completionText(schedule)}</strong>
      </div>
    </section>
  );
}
