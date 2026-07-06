import React, { useState, useEffect } from 'react';
import { getSavedPlans, savePlan, deletePlan } from '../utils/storage';

export default function SaveLoadPanel({ inputs, onLoadPlan }) {
  const [plans, setPlans] = useState([]);
  const [planName, setPlanName] = useState('');
  const [message, setMessage] = useState('');

  const refreshPlans = () => {
    setPlans(getSavedPlans());
  };

  useEffect(() => {
    refreshPlans();
  }, []);

  const handleSave = () => {
    const name = planName.trim();
    if (!name) {
      setMessage('Please enter a plan name.');
      return;
    }
    savePlan(name, inputs);
    setPlanName('');
    setMessage(`Plan "${name}" saved.`);
    refreshPlans();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLoad = (id) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    onLoadPlan(plan.data);
    setMessage(`Plan "${plan.name}" loaded.`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    deletePlan(id);
    setMessage(`Plan "${plan.name}" deleted.`);
    refreshPlans();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="save-load-panel">
      <div className="section-header">
        <h3 className="section-title">Save / Load Plan</h3>
      </div>

      <div className="save-section">
        <div className="input-row">
          <label htmlFor="planName">Plan Name</label>
          <input
            type="text"
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. My 3-month taper"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
          />
        </div>
        <button type="button" className="btn-primary btn-save" onClick={handleSave}>
          Save Plan
        </button>
      </div>

      {message && <p className="save-message">{message}</p>}

      {plans.length > 0 && (
        <div className="saved-plans-list">
          <h4 className="saved-plans-title">Saved Plans</h4>
          {plans.map(plan => (
            <div key={plan.id} className="saved-plan-row">
              <div className="saved-plan-info">
                <span className="saved-plan-name">{plan.name}</span>
                <span className="saved-plan-date">
                  {new Date(plan.savedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="saved-plan-actions">
                <button type="button" className="btn-secondary btn-load" onClick={() => handleLoad(plan.id)}>
                  Load
                </button>
                <button type="button" className="btn-remove" onClick={() => handleDelete(plan.id)} aria-label={`Delete ${plan.name}`}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
