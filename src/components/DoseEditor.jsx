import React from 'react';
import { totalDailyDose, formatNumber } from '../utils/taperEngine';

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

export default function DoseEditor({ doses, doseCount, onChange }) {
  const handlePresetChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      onChange({ doseCount: 'custom', doses });
      return;
    }
    const count = parseInt(value, 10);
    const newDoses = [...doses];
    if (count > newDoses.length) {
      while (newDoses.length < count) {
        newDoses.push(makeDose(newDoses.length));
      }
    } else if (count < newDoses.length) {
      newDoses.length = count;
    }
    onChange({ doseCount: value, doses: newDoses });
  };

  const handleCustomCount = (e) => {
    const count = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1));
    const newDoses = [...doses];
    if (count > newDoses.length) {
      while (newDoses.length < count) {
        newDoses.push(makeDose(newDoses.length));
      }
    } else if (count < newDoses.length) {
      newDoses.length = count;
    }
    onChange({ doses: newDoses });
  };

  const handleAddDose = () => {
    const newDoses = [...doses, makeDose(doses.length)];
    onChange({ doseCount: 'custom', doses: newDoses });
  };

  const handleRemoveDose = (doseId) => {
    const newDoses = doses.filter(d => d.id !== doseId);
    onChange({ doses: newDoses });
  };

  const handleDoseChange = (doseId, field, value) => {
    const newDoses = doses.map(d =>
      d.id === doseId ? { ...d, [field]: value } : d
    );
    onChange({ doses: newDoses });
  };

  const handleMoveDose = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= doses.length) return;
    const newDoses = [...doses];
    [newDoses[idx], newDoses[newIdx]] = [newDoses[newIdx], newDoses[idx]];
    onChange({ doses: newDoses });
  };

  const currentTotal = totalDailyDose(doses);

  return (
    <div className="dose-editor">
      <div className="section-header">
        <h3 className="section-title">Dose Schedule Setup</h3>
        <span className="section-hint">Define each daily dose</span>
      </div>

      <div className="input-row">
        <label htmlFor="doseCount">Number of Daily Doses</label>
        <select id="doseCount" value={doseCount} onChange={handlePresetChange}>
          <option value="1">1 dose</option>
          <option value="2">2 doses</option>
          <option value="3">3 doses</option>
          <option value="4">4 doses</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {doseCount === 'custom' && (
        <div className="input-row">
          <label htmlFor="customDoseCount">Custom Number of Doses</label>
          <input
            type="number"
            id="customDoseCount"
            value={doses.length}
            onChange={handleCustomCount}
            min="1"
            max="10"
            step="1"
          />
        </div>
      )}

      <div className="doses-list">
        {doses.map((dose, idx) => (
          <div key={dose.id} className="dose-card">
            <div className="dose-card-header">
              <div className="dose-card-header-left">
                <span className="dose-number">Dose {idx + 1}</span>
                <div className="dose-reorder">
                  <button
                    type="button"
                    className="btn-reorder"
                    onClick={() => handleMoveDose(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move dose up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn-reorder"
                    onClick={() => handleMoveDose(idx, 1)}
                    disabled={idx === doses.length - 1}
                    aria-label="Move dose down"
                  >
                    ↓
                  </button>
                </div>
              </div>
              {doses.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveDose(dose.id)}
                  aria-label={`Remove ${dose.label || `Dose ${idx + 1}`}`}
                >
                  ×
                </button>
              )}
            </div>
            <div className="dose-fields">
              <div className="dose-field">
                <label>Label / Time</label>
                <input
                  type="text"
                  value={dose.label}
                  onChange={(e) => handleDoseChange(dose.id, 'label', e.target.value)}
                  placeholder="e.g. Morning"
                />
              </div>
              <div className="dose-field">
                <label>Time</label>
                <input
                  type="time"
                  value={dose.time || ''}
                  onChange={(e) => handleDoseChange(dose.id, 'time', e.target.value)}
                />
              </div>
              <div className="dose-field">
                <label>Tablet (mg)</label>
                <input
                  type="number"
                  value={dose.tabletMg}
                  onChange={(e) => handleDoseChange(dose.id, 'tabletMg', e.target.value)}
                  min="0"
                  step="0.25"
                  placeholder="0"
                />
              </div>
              <div className="dose-field">
                <label>Liquid (mL)</label>
                <input
                  type="number"
                  value={dose.liquidMl}
                  onChange={(e) => handleDoseChange(dose.id, 'liquidMl', e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>
              <div className="dose-field">
                <label>Conc. (mg/mL)</label>
                <input
                  type="number"
                  value={dose.mgPerMl}
                  onChange={(e) => handleDoseChange(dose.id, 'mgPerMl', e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div className="dose-field dose-field-notes">
                <label>Notes</label>
                <input
                  type="text"
                  value={dose.notes || ''}
                  onChange={(e) => handleDoseChange(dose.id, 'notes', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add" onClick={handleAddDose}>
        + Add Dose
      </button>

      <div className="input-row concentration-display">
        <label>Current Total Daily Dose</label>
        <span className="concentration-result">
          {currentTotal > 0 ? `${formatNumber(currentTotal)} mg` : '--'}
        </span>
      </div>
    </div>
  );
}
