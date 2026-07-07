import React, { useMemo, useState } from 'react';
import { formatNumber, totalDailyDose } from '../utils/taperEngine';
import DoseCheckItem from './DoseCheckItem';
import SupportRail from './SupportRail';
import ThemeCompletionCue from './ThemeCompletionCue';

const FEELING_OPTIONS = [
  { id: 'better', label: 'Better' },
  { id: 'same', label: 'Same' },
  { id: 'more_difficult', label: 'More difficult' },
];

const PLAN_STATUS_OPTIONS = [
  { id: 'followed', label: 'Plan followed' },
  { id: 'adjusted', label: 'Plan adjusted' },
  { id: 'rest_point', label: 'Rest point taken' },
  { id: 'missed_logged', label: 'Dose missed and logged' },
  { id: 'support_needed', label: 'Support needed' },
  { id: 'followup_planned', label: 'Follow-up planned' },
];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function doseMg(dose) {
  return (parseFloat(dose.tabletMg) || 0) + (parseFloat(dose.liquidMl) || 0) * (parseFloat(dose.mgPerMl) || 0);
}

export default function TodayStep({ inputs, schedule, existingCheckIn, theme, onSave, onClose }) {
  const today = getTodayKey();
  const todayRoute = schedule?.[0] || null;
  const sourceDoses = todayRoute?.doses || inputs.doses;
  const [doseLogs, setDoseLogs] = useState(() => (
    existingCheckIn?.doseLogs || sourceDoses.map((dose, index) => ({
      doseId: dose.id || `dose-${index}`,
      label: dose.label || `Dose ${index + 1}`,
      scheduledAmount: doseMg(dose),
      status: 'complete',
      note: '',
    }))
  ));
  const [comparedToYesterday, setComparedToYesterday] = useState(existingCheckIn?.comparedToYesterday || '');
  const [planStatus, setPlanStatus] = useState(existingCheckIn?.planStatus || 'followed');
  const [note, setNote] = useState(existingCheckIn?.note || '');
  const [saved, setSaved] = useState(false);
  const total = useMemo(() => totalDailyDose(sourceDoses), [sourceDoses]);

  const handleDoseLog = (nextLog) => {
    setDoseLogs(prev => prev.map(log => (log.doseId === nextLog.doseId ? nextLog : log)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const checkIn = onSave({
      date: today,
      routeDay: todayRoute?.day || 1,
      doseLogs,
      comparedToYesterday: comparedToYesterday || null,
      planStatus,
      note,
    });
    if (checkIn) setSaved(true);
  };

  return (
    <div className="today-step-shell">
      <form className="today-step-main compass-card" onSubmit={handleSubmit}>
        <div className="card-header-row">
          <div>
            <p className="eyebrow">Today's Step</p>
            <h2>{formatNumber(total)} mg scheduled</h2>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="dose-check-list">
          {doseLogs.map(log => (
            <DoseCheckItem key={log.doseId} doseLog={log} onChange={handleDoseLog} />
          ))}
        </div>

        <section className="today-step-section">
          <h3>Compared to yesterday</h3>
          <div className="segmented-control">
            {FEELING_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                className={comparedToYesterday === option.id ? 'active' : ''}
                onClick={() => setComparedToYesterday(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="today-step-section">
          <h3>Plan status</h3>
          <div className="plan-status-grid">
            {PLAN_STATUS_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                className={planStatus === option.id ? 'active' : ''}
                onClick={() => setPlanStatus(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="today-step-section">
          <h3>Optional note</h3>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Short note for your journey record"
            rows={3}
          />
        </section>

        <div className="today-step-actions">
          <button type="submit" className="btn-primary">Finish Check-in</button>
          <span>Logging what happened preserves continuity.</span>
        </div>
        <ThemeCompletionCue theme={theme} visible={saved} />
      </form>
      <SupportRail />
    </div>
  );
}
