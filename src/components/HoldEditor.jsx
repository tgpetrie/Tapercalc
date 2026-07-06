import React from 'react';

export default function HoldEditor({ holds, onChange }) {
  const handleAddHold = () => {
    const newHold = {
      id: `hold-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startDay: '',
      lengthDays: '',
      reason: '',
    };
    onChange([...holds, newHold]);
  };

  const handleHoldChange = (holdId, field, value) => {
    const newHolds = holds.map(h =>
      h.id === holdId ? { ...h, [field]: value } : h
    );
    onChange(newHolds);
  };

  const handleRemoveHold = (holdId) => {
    onChange(holds.filter(h => h.id !== holdId));
  };

  return (
    <div className="hold-editor">
      <div className="section-header">
        <h3 className="section-title">Holds / Pauses</h3>
        <button type="button" className="btn-add" onClick={handleAddHold}>
          + Add Hold
        </button>
      </div>

      {holds.length === 0 ? (
        <p className="empty-state">No hold periods. Taper will run continuously.</p>
      ) : (
        <div className="holds-list">
          {holds.map((hold, idx) => (
            <div key={hold.id} className="hold-card">
              <div className="hold-card-header">
                <span className="hold-number">Hold #{idx + 1}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveHold(hold.id)}
                  aria-label={`Remove Hold #{idx + 1}`}
                >
                  ×
                </button>
              </div>
              <div className="hold-fields">
                <div className="hold-field">
                  <label>Start Day</label>
                  <input
                    type="number"
                    value={hold.startDay}
                    onChange={(e) => handleHoldChange(hold.id, 'startDay', e.target.value)}
                    min="1"
                    step="1"
                    placeholder="e.g. 15"
                  />
                </div>
                <div className="hold-field">
                  <label>Length (days)</label>
                  <input
                    type="number"
                    value={hold.lengthDays}
                    onChange={(e) => handleHoldChange(hold.id, 'lengthDays', e.target.value)}
                    min="1"
                    step="1"
                    placeholder="e.g. 7"
                  />
                </div>
                <div className="hold-field hold-field-reason">
                  <label>Reason / Note (optional)</label>
                  <input
                    type="text"
                    value={hold.reason}
                    onChange={(e) => handleHoldChange(hold.id, 'reason', e.target.value)}
                    placeholder="e.g. Stabilize before next cut"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
