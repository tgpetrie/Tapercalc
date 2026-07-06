import React, { useMemo } from 'react';
import DoseEditor from './components/DoseEditor';
import HoldEditor from './components/HoldEditor';
import SaveLoadPanel from './components/SaveLoadPanel';
import { validateInputs } from './utils/taperMath';

export default function InputPanel({ inputs, setInputs, onCalculate, onLoadPlan }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleDoseEditorChange = ({ doseCount, doses }) => {
    setInputs(prev => ({
      ...prev,
      ...(doseCount !== undefined ? { doseCount } : {}),
      ...(doses !== undefined ? { doses } : {}),
    }));
  };

  const handleHoldsChange = (holds) => {
    setInputs(prev => ({ ...prev, holds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate();
  };

  const warnings = useMemo(() => validateInputs(inputs), [inputs]);

  return (
    <div className="panel input-panel">
      <h2 className="panel-title">Taper Configuration</h2>
      <form onSubmit={handleSubmit}>

        <DoseEditor
          doses={inputs.doses}
          doseCount={inputs.doseCount}
          onChange={handleDoseEditorChange}
        />

        {/* ===== Taper Settings ===== */}
        <div className="section-header">
          <h3 className="section-title">Taper Settings</h3>
        </div>

        <div className="input-row">
          <label htmlFor="targetDose">Target Daily Dose (mg)</label>
          <input
            type="number"
            id="targetDose"
            name="targetDose"
            value={inputs.targetDose}
            onChange={handleChange}
            min="0"
            step="0.25"
            required
          />
        </div>

        <div className="input-row">
          <label htmlFor="taperType">Taper Strategy</label>
          <select
            id="taperType"
            name="taperType"
            value={inputs.taperType}
            onChange={handleChange}
          >
            <option value="linear">Linear (Fixed Amount)</option>
            <option value="percentage">Percentage-Based (Monthly)</option>
          </select>
        </div>

        {inputs.taperType === 'linear' ? (
          <div className="input-row">
            <label htmlFor="reductionAmount">Reduction per Step (mg)</label>
            <input
              type="number"
              id="reductionAmount"
              name="reductionAmount"
              value={inputs.reductionAmount}
              onChange={handleChange}
              min="0.125"
              step="0.125"
              required
            />
          </div>
        ) : (
          <div className="input-row">
            <label htmlFor="reductionPercent">Reduction per Month (%)</label>
            <input
              type="number"
              id="reductionPercent"
              name="reductionPercent"
              value={inputs.reductionPercent}
              onChange={handleChange}
              min="1"
              max="50"
              step="0.5"
              required
            />
          </div>
        )}

        <div className="input-row">
          <label htmlFor="stepDuration">Step Duration (days)</label>
          <input
            type="number"
            id="stepDuration"
            name="stepDuration"
            value={inputs.stepDuration}
            onChange={handleChange}
            min="1"
            step="1"
            required
          />
        </div>

        {inputs.taperType === 'percentage' && (
          <p className="mode-hint">
            Percentage mode recalculates every 30 days based on the current dose
            at the start of each 30-day block.
          </p>
        )}

        {/* ===== Cut Distribution ===== */}
        <div className="section-header">
          <h3 className="section-title">Cut Distribution</h3>
          <span className="section-hint">How reductions are applied across doses</span>
        </div>

        <div className="input-row">
          <label htmlFor="cutStrategy">Distribution Strategy</label>
          <select
            id="cutStrategy"
            name="cutStrategy"
            value={inputs.cutStrategy}
            onChange={handleChange}
          >
            <option value="alternate">Alternate between all doses</option>
            <option value="firstFirst">Cut from first dose first</option>
            <option value="lastFirst">Cut from last dose first</option>
            <option value="splitEvenly">Split evenly across all doses</option>
            <option value="custom">Custom priority order</option>
          </select>
        </div>

        {inputs.cutStrategy === 'custom' && (
          <div className="custom-order-section">
            <p className="custom-order-hint">
              Enter priority numbers 1-{inputs.doses.length} (1 = cut first).
            </p>
            {inputs.doses.map((dose, idx) => (
              <div key={dose.id} className="custom-order-row">
                <span className="custom-order-label">{dose.label || `Dose ${idx + 1}`}</span>
                <input
                  type="number"
                  min="1"
                  max={inputs.doses.length}
                  step="1"
                  value={inputs.customOrder.indexOf(idx) >= 0 ? inputs.customOrder.indexOf(idx) + 1 : ''}
                  onChange={(e) => {
                    const priority = parseInt(e.target.value, 10) - 1;
                    if (isNaN(priority) || priority < 0 || priority >= inputs.doses.length) return;
                    setInputs(prev => {
                      const newOrder = [...prev.customOrder];
                      while (newOrder.length < prev.doses.length) {
                        const missing = prev.doses.findIndex((_, i) => !newOrder.includes(i));
                        newOrder.push(missing >= 0 ? missing : 0);
                      }
                      const existingPos = newOrder.indexOf(idx);
                      if (existingPos >= 0) newOrder.splice(existingPos, 1);
                      newOrder.splice(priority, 0, idx);
                      return { ...prev, customOrder: newOrder };
                    });
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <HoldEditor
          holds={inputs.holds}
          onChange={handleHoldsChange}
        />

        {/* ===== Start Date ===== */}
        <div className="section-header">
          <h3 className="section-title">Schedule</h3>
        </div>

        <div className="input-row">
          <label htmlFor="startDate">Start Date (optional)</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={inputs.startDate}
            onChange={handleChange}
          />
        </div>

        {/* ===== Validation Warnings ===== */}
        {warnings.length > 0 && (
          <div className="warnings-section">
            {warnings.map((w, i) => (
              <div key={i} className="warning-item">
                <span className="warning-icon">!</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-primary">
          Generate Schedule
        </button>
      </form>

      <SaveLoadPanel inputs={inputs} onLoadPlan={onLoadPlan} />
    </div>
  );
}
