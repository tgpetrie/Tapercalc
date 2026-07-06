import React, { useState } from 'react';

const DEFAULT_DOSE_LABELS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

function makeDose(idx) {
  return {
    id: `dose-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    label: DEFAULT_DOSE_LABELS[idx] || `Dose ${idx + 1}`,
    tabletMg: '',
    liquidMl: '',
    mgPerMl: 1,
    time: '',
    notes: '',
  };
}

export default function TaperWizard({ onApply, onClose }) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    medicationName: '',
    currentDose: '',
    medicationType: 'both',
    dosesPerDay: 2,
    reductionStyle: 'smaller',
    frequency: 'weekly',
  });

  const steps = [
    {
      title: 'What medication are you tapering?',
      field: 'medicationName',
      type: 'text',
      placeholder: 'e.g. Diazepam, Lorazepam (optional)',
    },
    {
      title: 'What is your current daily dose?',
      field: 'currentDose',
      type: 'number',
      placeholder: 'e.g. 10',
      hint: 'Enter the total mg you take per day across all doses.',
    },
    {
      title: 'Tablet, liquid, or both?',
      field: 'medicationType',
      type: 'choice',
      options: [
        { value: 'tablet', label: 'Tablets only' },
        { value: 'liquid', label: 'Liquid only' },
        { value: 'both', label: 'Tablet + Liquid' },
      ],
    },
    {
      title: 'How many doses do you take each day?',
      field: 'dosesPerDay',
      type: 'choice',
      options: [
        { value: 1, label: '1 dose' },
        { value: 2, label: '2 doses' },
        { value: 3, label: '3 doses' },
        { value: 4, label: '4 doses' },
      ],
    },
    {
      title: 'How often do you want to reduce?',
      field: 'frequency',
      type: 'choice',
      options: [
        { value: 'daily', label: 'Small daily reductions (Microtaper)' },
        { value: 'weekly', label: 'Weekly reductions' },
        { value: 'biweekly', label: 'Every 2 weeks' },
        { value: 'monthly', label: 'Monthly reductions' },
      ],
    },
    {
      title: 'Do you want each cut to stay the same, or gradually become smaller?',
      field: 'reductionStyle',
      type: 'choice',
      options: [
        { value: 'same', label: 'Same size each time (Linear)' },
        { value: 'smaller', label: 'Gradually smaller (Hyperbolic)' },
      ],
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      applyConfig();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const applyConfig = () => {
    const doses = Array.from({ length: config.dosesPerDay }, (_, i) => {
      const dose = makeDose(i);
      if (config.medicationType === 'tablet' || config.medicationType === 'both') {
        const perDose = (parseFloat(config.currentDose) || 0) / config.dosesPerDay;
        dose.tabletMg = perDose;
      }
      if (config.medicationType === 'liquid' || config.medicationType === 'both') {
        const perDose = (parseFloat(config.currentDose) || 0) / config.dosesPerDay;
        dose.liquidMl = perDose;
        dose.mgPerMl = 1;
      }
      return dose;
    });

    const strategy = config.reductionStyle === 'same' ? 'linear' : 'hyperbolic';
    const targetDose = 0;
    const reductionAmount = (parseFloat(config.currentDose) || 0) * 0.05;
    const reductionPercent = 5;

    onApply({
      doses,
      doseCount: String(config.dosesPerDay),
      targetDose,
      strategy,
      frequency: config.frequency,
      customInterval: '',
      reductionAmount,
      reductionPercent,
      cutStrategy: 'alternate',
      customOrder: [],
      holds: [],
      startDate: '',
      medicationName: config.medicationName,
    });
  };

  const handleChange = (value) => {
    setConfig(prev => ({ ...prev, [currentStep.field]: value }));
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-modal">
        <div className="wizard-header">
          <h2 className="wizard-title">Taper Wizard</h2>
          <button type="button" className="wizard-close" onClick={onClose} aria-label="Close wizard">×</button>
        </div>

        <div className="wizard-progress">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`wizard-progress-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        <div className="wizard-body">
          <h3 className="wizard-question">{currentStep.title}</h3>

          {currentStep.type === 'text' && (
            <input
              type="text"
              className="wizard-input"
              value={config[currentStep.field]}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={currentStep.placeholder}
              autoFocus
            />
          )}

          {currentStep.type === 'number' && (
            <>
              <input
                type="number"
                className="wizard-input"
                value={config[currentStep.field]}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentStep.placeholder}
                min="0"
                step="0.25"
                autoFocus
              />
              {currentStep.hint && <p className="wizard-hint">{currentStep.hint}</p>}
            </>
          )}

          {currentStep.type === 'choice' && (
            <div className="wizard-choices">
              {currentStep.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`wizard-choice ${config[currentStep.field] === opt.value ? 'selected' : ''}`}
                  onClick={() => handleChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
          >
            {isLastStep ? 'Apply & Configure' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
