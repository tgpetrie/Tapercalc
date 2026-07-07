import React from 'react';
import { formatNumber, totalDailyDose } from '../utils/taperEngine';
import JourneyRecordCard from './JourneyRecordCard';
import JourneyStoryCard from './JourneyStoryCard';
import NextChangeCard from './NextChangeCard';
import SupportRail from './SupportRail';
import TodayDoseList from './TodayDoseList';

function formatToday(date = new Date()) {
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
    date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

function getUpcomingRestPoint(schedule) {
  return schedule?.find(item => item.status === 'hold') || null;
}

export default function TodayOverview({
  inputs,
  schedule,
  continuity,
  todayCheckIn,
  onContinue,
}) {
  const today = formatToday();
  const currentTotal = totalDailyDose(inputs.doses);
  const beginningDose = schedule?.[0]?.totalDailyDose || currentTotal;
  const targetDose = parseFloat(inputs.targetDose) || 0;
  const routeDay = todayCheckIn?.routeDay || schedule?.[0]?.day || 1;
  const upcomingRestPoint = getUpcomingRestPoint(schedule);

  return (
    <div className="today-workspace">
      <section className="today-overview-header">
        <div>
          <h2>Today</h2>
          <p>{today.weekday} / {today.date} / Day {routeDay}</p>
        </div>
      </section>

      <div className="today-content-grid">
        <div className="today-primary-column">
          <TodayDoseList
            inputs={inputs}
            schedule={schedule}
            todayCheckIn={todayCheckIn}
            onContinue={onContinue}
          />
          <JourneyStoryCard
            beginningDose={beginningDose}
            currentPosition={currentTotal}
            destinationDose={targetDose}
            schedule={schedule}
            routeDay={routeDay}
          />
        </div>

        <div className="today-secondary-column">
          <section className="current-position-compact compass-card">
            <span className="card-label">Current Position</span>
            <strong>{formatNumber(currentTotal)} mg</strong>
            <small>{schedule ? `${schedule.length} route days plotted` : 'Route not plotted yet'}</small>
          </section>
          <NextChangeCard schedule={schedule} />
          <JourneyRecordCard continuity={continuity} todayCheckIn={todayCheckIn} />
          <section className="upcoming-rest-card compass-card">
            <span className="card-label">Upcoming Rest Point</span>
            <strong>{upcomingRestPoint ? `Day ${upcomingRestPoint.day}` : 'None planned'}</strong>
            <small>{upcomingRestPoint?.note || 'Add rest points in Journey when needed'}</small>
          </section>
        </div>

        <SupportRail compact />
      </div>
    </div>
  );
}
