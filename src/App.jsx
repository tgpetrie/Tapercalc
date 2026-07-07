import React, { useMemo, useState } from 'react';
import InputPanel from './InputPanel';
import SummaryPanel from './SummaryPanel';
import ScheduleTable from './ScheduleTable';
import GuidePanel from './components/GuidePanel';
import TaperWizard from './components/TaperWizard';
import {
  PRODUCT_NAME,
  REFLECTIONS,
  THEMES,
  WORKSPACES,
  getGreeting,
} from './designSystem';
import {
  FREQUENCIES,
  STRATEGIES,
  formatNumber,
  generateSchedule,
  runCalculationSanityChecks,
  totalDailyDose,
  validateInputs,
} from './utils/taperEngine';

const DEFAULT_DOSE_LABELS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

function makeDefaultDoses(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `dose-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    label: DEFAULT_DOSE_LABELS[i] || `Dose ${i + 1}`,
    tabletMg: '',
    liquidMl: '',
    mgPerMl: 1,
    time: '',
    notes: '',
  }));
}

function makeDefaultInputs() {
  return {
    doses: makeDefaultDoses(2),
    doseCount: '2',
    targetDose: 2.5,
    strategy: 'linear',
    frequency: 'weekly',
    customInterval: '',
    reductionAmount: 2.5,
    reductionPercent: 10,
    cutStrategy: 'alternate',
    customOrder: [],
    holds: [],
    plan: { segments: [] },
    startDate: '',
    medicationName: '',
  };
}

function readInitialTheme() {
  try {
    return localStorage.getItem('compass-theme') || 'forest';
  } catch {
    return 'forest';
  }
}

function readInitialReflectionSetting() {
  try {
    return localStorage.getItem('compass-reflections') !== 'off';
  } catch {
    return true;
  }
}

function CompassLogo() {
  return (
    <div className="compass-logo" aria-hidden="true">
      <span className="compass-logo-needle" />
      <span className="compass-logo-center" />
    </div>
  );
}

function EmptyCalendarState({ onJourney }) {
  return (
    <section className="compass-card empty-route">
      <div>
        <p className="eyebrow">Route not plotted</p>
        <h2>Start with your current position.</h2>
        <p>
          Enter dose details, choose a strategy, and COMPASS will calculate a
          route table without changing the underlying medical calculation rules.
        </p>
      </div>
      <button type="button" className="btn-primary" onClick={onJourney}>
        Continue Journey
      </button>
    </section>
  );
}

function getRouteStats(schedule, inputs) {
  const currentTotal = totalDailyDose(inputs.doses);
  if (!schedule || schedule.length === 0) {
    return {
      currentTotal,
      routeDays: 0,
      targetDose: parseFloat(inputs.targetDose) || 0,
      nextMilestone: null,
      holdDays: 0,
      finalDose: currentTotal,
      percentComplete: 0,
    };
  }

  const finalDay = schedule[schedule.length - 1];
  const targetDose = parseFloat(inputs.targetDose) || 0;
  const startDose = schedule[0]?.totalDailyDose || currentTotal;
  const finalDose = finalDay.totalDailyDose;
  const nextMilestone = schedule.find(item => item.dailyReduction > 0 && item.day > 1) || schedule[0];
  const holdDays = schedule.filter(item => item.status === 'hold').length;
  const percentComplete = startDose > 0
    ? Math.max(0, Math.min(100, ((startDose - finalDose) / startDose) * 100))
    : 0;

  return {
    currentTotal,
    routeDays: schedule.length,
    targetDose,
    nextMilestone,
    holdDays,
    finalDose,
    percentComplete,
  };
}

function Dashboard({ inputs, schedule, reflectionsEnabled, onJourney, onCalendar, onGuide }) {
  const stats = getRouteStats(schedule, inputs);
  const strategy = STRATEGIES[inputs.strategy] || STRATEGIES.linear;
  const frequency = FREQUENCIES[inputs.frequency] || FREQUENCIES.weekly;
  const reflection = REFLECTIONS[new Date().getDate() - 1];
  const todayDose = schedule?.[0]?.totalDailyDose ?? stats.currentTotal;
  const nextRestPoint = schedule?.find(item => item.status === 'hold');

  return (
    <div className="dashboard-grid">
      <section className="current-position-card compass-card">
        <div className="card-header-row">
          <div>
            <p className="eyebrow">{getGreeting()}</p>
            <h2>Current Position</h2>
          </div>
          <CompassLogo />
        </div>
        <strong className="position-dose">{formatNumber(stats.currentTotal)} mg</strong>
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
            <strong>{formatNumber(stats.targetDose)} mg</strong>
          </div>
          <div>
            <span>Next Reduction</span>
            <strong>{stats.nextMilestone ? `Day ${stats.nextMilestone.day}` : 'After plotting'}</strong>
          </div>
          <div>
            <span>Next Rest Point</span>
            <strong>{nextRestPoint ? `Day ${nextRestPoint.day}` : 'None planned'}</strong>
          </div>
        </div>
      </section>

      <section className="metric-card">
        <span>Today's Dose</span>
        <strong>{formatNumber(todayDose)} mg</strong>
        <small>{inputs.medicationName || 'Medication not named yet'}</small>
      </section>
      <section className="metric-card">
        <span>Today's Schedule</span>
        <strong>{inputs.doses.length} doses</strong>
        <small>{inputs.doses.map(d => d.label).filter(Boolean).join(', ')}</small>
      </section>
      <section className="metric-card">
        <span>Next Milestone</span>
        <strong>{stats.nextMilestone ? `Day ${stats.nextMilestone.day}` : 'Not plotted'}</strong>
        <small>{stats.nextMilestone?.note || `${strategy.short} - ${frequency.label}`}</small>
      </section>

      <section className="compass-card quick-actions-card">
        <p className="eyebrow">Quick Actions</p>
        <div className="quick-actions-grid">
          <button type="button" className="btn-primary" onClick={onJourney}>Continue Journey</button>
          <button type="button" className="btn-secondary" onClick={onJourney}>Plot My Course</button>
          <button type="button" className="btn-secondary" onClick={onCalendar}>Print Route</button>
          <button type="button" className="btn-secondary" onClick={onGuide}>Guide</button>
        </div>
      </section>

      <section className="compass-card journey-card">
        <div className="card-header-row">
          <div>
            <p className="eyebrow">Journey Path</p>
            <h2>Route overview</h2>
          </div>
          <button type="button" className="text-button" onClick={onCalendar}>
            Open Calendar
          </button>
        </div>
        <JourneyPath schedule={schedule} />
      </section>

      <section className="compass-card summary-card">
        <p className="eyebrow">Journey Summary</p>
        <div className="summary-strip">
          <div>
            <strong>{stats.routeDays || '-'}</strong>
            <span>days</span>
          </div>
          <div>
            <strong>{formatNumber(stats.targetDose)}</strong>
            <span>target mg</span>
          </div>
          <div>
            <strong>{stats.holdDays}</strong>
            <span>rest days</span>
          </div>
          <div>
            <strong>{formatNumber(stats.percentComplete, 1)}%</strong>
            <span>planned reduction</span>
          </div>
        </div>
      </section>

      {reflectionsEnabled && (
        <section className="compass-card reflection-card">
          <p className="eyebrow">Today's Reflection</p>
          <blockquote>{reflection}</blockquote>
        </section>
      )}
    </div>
  );
}

function JourneyPath({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="journey-path empty">
        {['Current', 'First Cut', 'Rest Point', 'Midpoint', 'Target'].map((label, index) => (
          <div key={label} className={`journey-node ${index === 0 ? 'current' : 'future'}`}>
            <span />
            <strong>{label}</strong>
            <small>{index === 0 ? 'Ready' : 'Pending'}</small>
          </div>
        ))}
      </div>
    );
  }

  const count = Math.min(6, schedule.length);
  const points = Array.from({ length: count }, (_, index) => {
    const scheduleIndex = Math.round((index / (count - 1 || 1)) * (schedule.length - 1));
    return schedule[scheduleIndex];
  });

  return (
    <div className="journey-path">
      {points.map((point, index) => (
        <div
          key={`${point.day}-${index}`}
          className={`journey-node ${index === 0 ? 'current' : point.status === 'hold' ? 'rest' : point.status === 'target' ? 'target' : 'future'}`}
        >
          <span />
          <strong>Day {point.day}</strong>
          <small>{formatNumber(point.totalDailyDose)} mg</small>
        </div>
      ))}
    </div>
  );
}

function InsightsPage({ schedule, inputs }) {
  const stats = getRouteStats(schedule, inputs);
  return (
    <div className="page-stack">
      <section className="compass-card">
        <p className="eyebrow">Insights</p>
        <h2>Patterns prepared for future tracking.</h2>
        <p>
          Insights keeps future dose graphs, symptom trends, medication changes,
          timeline review, and provider reports out of the daily planning flow.
        </p>
      </section>
      <div className="report-grid">
        <div className="metric-card">
          <span>Route Length</span>
          <strong>{stats.routeDays || '-'}</strong>
          <small>calculated days</small>
        </div>
        <div className="metric-card">
          <span>Final Position</span>
          <strong>{formatNumber(stats.finalDose)} mg</strong>
          <small>last route row</small>
        </div>
        <div className="metric-card">
          <span>Rest Points</span>
          <strong>{stats.holdDays}</strong>
          <small>planned hold days</small>
        </div>
        <div className="metric-card">
          <span>Dose Graph</span>
          <strong>Ready</strong>
          <small>future visualization</small>
        </div>
        <div className="metric-card">
          <span>Symptom Trends</span>
          <strong>Future</strong>
          <small>diary integration</small>
        </div>
        <div className="metric-card">
          <span>Provider Reports</span>
          <strong>Future</strong>
          <small>PDF export path</small>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ theme, setTheme, reflectionsEnabled, setReflectionsEnabled }) {
  const handleTheme = (nextTheme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem('compass-theme', nextTheme);
    } catch {
      // Ignore storage failures; the selected theme still applies in memory.
    }
  };

  const handleReflections = () => {
    const next = !reflectionsEnabled;
    setReflectionsEnabled(next);
    try {
      localStorage.setItem('compass-reflections', next ? 'on' : 'off');
    } catch {
      // Ignore storage failures; the setting still applies in memory.
    }
  };

  return (
    <div className="page-stack">
      <section className="compass-card">
        <p className="eyebrow">Settings</p>
        <h2>Set the workspace tone.</h2>
        <p>Choose a calm palette and decide whether daily reflections appear on the Dashboard.</p>
      </section>
      <section className="compass-card">
        <h3>Theme</h3>
        <div className="theme-grid">
          {THEMES.map(item => (
            <button
              key={item.id}
              type="button"
              className={`theme-swatch theme-${item.id} ${theme === item.id ? 'selected' : ''}`}
              onClick={() => handleTheme(item.id)}
            >
              <span />
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section className="compass-card settings-row">
        <div>
          <h3>Daily reflections</h3>
          <p>Show one calm reflection on the Dashboard each day.</p>
        </div>
        <button
          type="button"
          className={`toggle ${reflectionsEnabled ? 'on' : ''}`}
          onClick={handleReflections}
          aria-pressed={reflectionsEnabled}
        >
          <span />
        </button>
      </section>
    </div>
  );
}

function EngineStatus({ inputs, schedule }) {
  const warnings = useMemo(() => validateInputs(inputs), [inputs]);
  const checks = useMemo(() => runCalculationSanityChecks(), []);
  const strategy = STRATEGIES[inputs.strategy] || STRATEGIES.linear;
  const frequency = FREQUENCIES[inputs.frequency] || FREQUENCIES.weekly;
  const startingDose = totalDailyDose(inputs.doses);
  const checkFailures = checks.filter(result => !result.passed);
  const reduction = strategy.needsPercent
    ? `${formatNumber(parseFloat(inputs.reductionPercent) || 0, 2)}%`
    : `${formatNumber(parseFloat(inputs.reductionAmount) || 0, 4)} mg`;

  return (
    <section className="engine-status compass-card">
      <div className="card-header-row">
        <div>
          <p className="eyebrow">Engine Status</p>
          <h3>Calculation preview</h3>
        </div>
        <span className={`status-pill ${checkFailures.length ? 'warning' : 'success'}`}>
          {checkFailures.length ? `${checkFailures.length} checks need review` : 'Sanity checks passed'}
        </span>
      </div>
      <div className="engine-grid">
        <div>
          <span>Strategy</span>
          <strong>{strategy.short}</strong>
        </div>
        <div>
          <span>Frequency</span>
          <strong>{frequency.label}</strong>
        </div>
        <div>
          <span>Starting dose</span>
          <strong>{formatNumber(startingDose)} mg</strong>
        </div>
        <div>
          <span>Reduction</span>
          <strong>{reduction}</strong>
        </div>
        <div>
          <span>Generated days</span>
          <strong>{schedule?.length || 0}</strong>
        </div>
        <div>
          <span>Warnings</span>
          <strong>{warnings.length}</strong>
        </div>
      </div>
      {warnings.length > 0 && (
        <ul className="warning-list">
          {warnings.map((warning, index) => (
            <li key={`${warning}-${index}`}>{warning}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [inputs, setInputs] = useState(makeDefaultInputs);
  const [schedule, setSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [theme, setTheme] = useState(readInitialTheme);
  const [reflectionsEnabled, setReflectionsEnabled] = useState(readInitialReflectionSetting);

  const routeStats = useMemo(() => getRouteStats(schedule, inputs), [schedule, inputs]);

  const handleCalculate = () => {
    const { doses, targetDose, strategy, frequency, customInterval, reductionAmount, reductionPercent, cutStrategy, customOrder, holds, startDate } = inputs;

    const startTotal = totalDailyDose(doses);
    const parsedTarget = parseFloat(targetDose);

    if (startTotal <= 0) {
      alert('Please enter at least one dose (tablet mg or liquid mL) greater than 0.');
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget < 0) {
      alert('Please enter a valid target dose.');
      return;
    }
    if (parsedTarget >= startTotal) {
      alert('Target dose must be less than the current total daily dose.');
      return;
    }

    const calculated = generateSchedule({
      doses,
      targetDose: parsedTarget,
      strategy,
      frequency,
      customInterval,
      reductionAmount,
      reductionPercent,
      cutStrategy,
      customOrder,
      holds,
      startDate,
    });

    setSchedule(calculated);
    setActiveTab('calendar');
  };

  const handleLoadPlan = (planData) => {
    setInputs({ ...makeDefaultInputs(), ...planData });
    setSchedule(null);
  };

  const handleWizardApply = (wizardConfig) => {
    setInputs(prev => ({ ...prev, ...wizardConfig }));
    setShowWizard(false);
  };

  return (
    <div className={`compass-app theme-${theme}`}>
      <aside className="app-sidebar">
        <div className="brand-lockup">
          <CompassLogo />
          <div>
            <strong>{PRODUCT_NAME}</strong>
            <span>Taper Planner 1.0</span>
          </div>
        </div>
        <nav className="app-nav" aria-label="Primary">
          {WORKSPACES.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-status">
          <span>Current Position</span>
          <strong>{formatNumber(routeStats.currentTotal)} mg</strong>
          <small>{schedule ? `${routeStats.routeDays} route days plotted` : 'No route plotted yet'}</small>
        </div>
      </aside>

      <div className="app-shell">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">Medication taper planning workspace</p>
            <h1>{WORKSPACES.find(item => item.id === activeTab)?.label || 'Dashboard'}</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowWizard(true)}>
              Guided Setup
            </button>
            <button type="button" className="btn-primary" onClick={() => setActiveTab('journey')}>
              Plot My Course
            </button>
          </div>
        </header>

        <div className="disclaimer-banner">
          <strong>Calculation tool only.</strong> COMPASS does not recommend taper schedules or
          provide medical advice. Review all plans with an appropriate healthcare professional.
        </div>

        <main className="app-main">
          {activeTab === 'dashboard' && (
            <Dashboard
              inputs={inputs}
              schedule={schedule}
              reflectionsEnabled={reflectionsEnabled}
              onJourney={() => setActiveTab('journey')}
              onCalendar={() => setActiveTab('calendar')}
              onGuide={() => setActiveTab('guide')}
            />
          )}

          {activeTab === 'journey' && (
            <div className="page-stack">
              <section className="compass-card plan-intro">
                <div>
                  <p className="eyebrow">Journey</p>
                  <h2>Build the route from the essentials first.</h2>
                  <p>
                    Dose, strategy, frequency, and target stay primary. Advanced cut
                    distribution, rest points, and calendar details remain available
                    without crowding the first decision.
                  </p>
                </div>
              </section>
              <InputPanel
                inputs={inputs}
                setInputs={setInputs}
                onCalculate={handleCalculate}
                onLoadPlan={handleLoadPlan}
              />
              <EngineStatus inputs={inputs} schedule={schedule} />
            </div>
          )}

          {activeTab === 'calendar' && (
            schedule && schedule.length > 0 ? (
              <div className="page-stack">
                <section className="compass-card route-overview">
                  <div>
                    <p className="eyebrow">Calendar</p>
                    <h2>{routeStats.routeDays} days plotted toward {formatNumber(routeStats.targetDose)} mg.</h2>
                    <p>
                      The calculated route below keeps the original taper engine intact,
                      with route language layered over the output.
                    </p>
                  </div>
                  <JourneyPath schedule={schedule} />
                </section>
                <SummaryPanel schedule={schedule} inputs={inputs} />
                <ScheduleTable schedule={schedule} doseLabels={inputs.doses.map(d => d.label)} />
              </div>
            ) : (
              <EmptyCalendarState onJourney={() => setActiveTab('journey')} />
            )
          )}

          {activeTab === 'guide' && <GuidePanel />}

          {activeTab === 'insights' && <InsightsPage schedule={schedule} inputs={inputs} />}

          {activeTab === 'settings' && (
            <SettingsPage
              theme={theme}
              setTheme={setTheme}
              reflectionsEnabled={reflectionsEnabled}
              setReflectionsEnabled={setReflectionsEnabled}
            />
          )}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile primary">
        {WORKSPACES.slice(0, 5).map(item => (
          <button
            key={item.id}
            type="button"
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item.id)}
          >
            {item.shortLabel}
          </button>
        ))}
      </nav>

      {showWizard && (
        <TaperWizard onApply={handleWizardApply} onClose={() => setShowWizard(false)} />
      )}
    </div>
  );
}
