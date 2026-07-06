import React, { useState } from 'react';
import InputPanel from './InputPanel';
import SummaryPanel from './SummaryPanel';
import ScheduleTable from './ScheduleTable';
import { generateSchedule, totalDailyDose } from './utils/taperMath';

const DEFAULT_DOSE_LABELS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

function makeDefaultDoses(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `dose-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    label: DEFAULT_DOSE_LABELS[i] || `Dose ${i + 1}`,
    tabletMg: '',
    liquidMl: '',
    mgPerMl: 1,
  }));
}

export default function App() {
  const [inputs, setInputs] = useState({
    doses: makeDefaultDoses(2),
    doseCount: '2',
    targetDose: 2.5,
    taperType: 'linear',
    reductionAmount: 2.5,
    reductionPercent: 10,
    stepDuration: 14,
    cutStrategy: 'alternate',
    customOrder: [],
    holds: [],
    startDate: '',
  });

  const [schedule, setSchedule] = useState(null);

  const handleCalculate = () => {
    const {
      doses,
      targetDose,
      taperType,
      reductionAmount,
      reductionPercent,
      stepDuration,
      cutStrategy,
      customOrder,
      holds,
      startDate,
    } = inputs;

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
      taperType,
      reductionAmount,
      reductionPercent,
      stepDuration,
      cutStrategy,
      customOrder,
      holds,
      startDate,
    });

    setSchedule(calculated);
  };

  const handleLoadPlan = (planData) => {
    setInputs(planData);
    setSchedule(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Medication Taper Calculator</h1>
        <p className="subtitle">Generate safe, gradual dose reduction schedules with multi-dose support</p>
      </header>

      <main className="app-main">
        <InputPanel
          inputs={inputs}
          setInputs={setInputs}
          onCalculate={handleCalculate}
          onLoadPlan={handleLoadPlan}
        />

        {schedule && schedule.length > 0 && (
          <>
            <SummaryPanel schedule={schedule} />
            <ScheduleTable schedule={schedule} doseLabels={inputs.doses.map(d => d.label)} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Always consult with a healthcare provider before adjusting medication doses</p>
      </footer>
    </div>
  );
}
