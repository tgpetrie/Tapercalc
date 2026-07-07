import React from 'react';
import { formatNumber } from '../utils/taperEngine';

const STATUS_OPTIONS = [
  { id: 'complete', label: 'Complete' },
  { id: 'late', label: 'Late' },
  { id: 'missed', label: 'Missed' },
  { id: 'adjusted', label: 'Adjusted' },
];

export default function DoseCheckItem({ doseLog, onChange }) {
  return (
    <div className="dose-check-item">
      <div>
        <strong>{doseLog.label}</strong>
        <span>{formatNumber(doseLog.scheduledAmount)} mg scheduled</span>
      </div>
      <div className="segmented-control" role="group" aria-label={`${doseLog.label} status`}>
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={doseLog.status === option.id ? 'active' : ''}
            onClick={() => onChange({ ...doseLog, status: option.id })}
          >
            {option.label}
          </button>
        ))}
      </div>
      {doseLog.status === 'adjusted' && (
        <input
          type="text"
          value={doseLog.note || ''}
          onChange={(event) => onChange({ ...doseLog, note: event.target.value })}
          placeholder="Short adjustment note"
          aria-label={`${doseLog.label} adjustment note`}
        />
      )}
    </div>
  );
}
