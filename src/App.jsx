import React, { useState } from 'react';
import InputPanel from './InputPanel';
import SummaryPanel from './SummaryPanel';
import ScheduleTable from './ScheduleTable';
import GuidePanel from './components/GuidePanel';
import TaperWizard from './components/TaperWizard';
import { generateSchedule, totalDailyDose } from './utils/taperEngine';

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
    startDate: '',
    medicationName: '',
  };
}

export default function App() {
  const [inputs, setInputs] = useState(makeDefaultInputs);
  const [schedule, setSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('planner');
  const [showWizard, setShowWizard] = useState(false);

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
    <div className="app-container">
      <header className="app-header">
        <h1>Medication Taper Planner</h1>
        <p className="subtitle">A flexible taper planning tool for medication dose reduction</p>
      </header>

      <div className="disclaimer-banner">
        <strong>Disclaimer:</strong> This tool performs calculations only. It does NOT recommend
        taper schedules or provide medical advice. All taper plans should be reviewed with an
        appropriate healthcare professional.
      </div>

      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Planner
        </button>
        <button
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          Guide
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'planner' && (
          <>
            <div className="wizard-launch-section">
              <button className="btn-secondary btn-wizard" onClick={() => setShowWizard(true)}>
                Start Taper Wizard
              </button>
              <span className="wizard-launch-hint">Guided setup for a new taper plan</span>
            </div>

            <InputPanel
              inputs={inputs}
              setInputs={setInputs}
              onCalculate={handleCalculate}
              onLoadPlan={handleLoadPlan}
            />

            {schedule && schedule.length > 0 && (
              <>
                <SummaryPanel schedule={schedule} inputs={inputs} />
                <ScheduleTable schedule={schedule} doseLabels={inputs.doses.map(d => d.label)} />
              </>
            )}
          </>
        )}

        {activeTab === 'guide' && (
          <GuidePanel />
        )}
      </main>

      {showWizard && (
        <TaperWizard onApply={handleWizardApply} onClose={() => setShowWizard(false)} />
      )}

      <footer className="app-footer">
        <p>Always consult with a healthcare provider before adjusting medication doses</p>
      </footer>
    </div>
  );
}
