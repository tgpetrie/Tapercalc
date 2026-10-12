import React, { useState } from 'react';
import { daysWalked, fmtDose, currentDose, exportEverything } from './model.js';

/**
 * Settings — a door, not a destination. One flat list.
 * Data dignity is a headline here, not fine print.
 */

export default function Settings({ state, actions, identity, syncError, onAccount, onSignOut, onEraseAll, onClose }) {
  const [confirmErase, setConfirmErase] = useState(false);
  const walked = daysWalked(state);

  return (
    <div className="page settings">
      <button className="back-link" onClick={onClose}>← back</button>
      <h1>Settings</h1>

      <div className="settings__row">
        <span className="settings__label">Account</span>
        {identity.kind === 'user' ? (
          <span className="settings__value" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {identity.email}
            <button className="door" onClick={onSignOut}>sign out</button>
          </span>
        ) : identity.kind === 'sample' ? (
          <span className="settings__value" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            sample route — nothing here is saved
            <button className="door" onClick={onAccount}>leave sample</button>
          </span>
        ) : (
          <span className="settings__value" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            guest — saved on this device only
            <button className="door" onClick={onAccount}>create account or sign in</button>
          </span>
        )}
      </div>

      {syncError && (
        <p className="settings__value" role="alert" style={{ margin: '0.4rem 0 0.8rem' }}>
          Your latest changes haven’t reached your account yet. They’ll keep trying while this page is open.
        </p>
      )}

      <div className="settings__row">
        <span className="settings__label">Your record, yours — export everything</span>
        <button className="door" onClick={() => exportEverything(state)}>export</button>
      </div>

      <div className="settings__row">
        <span className="settings__label settings__danger">
          {confirmErase ? 'Erase every trace? This cannot be undone.' : 'Delete everything'}
        </span>
        {confirmErase ? (
          <span style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="door" onClick={() => setConfirmErase(false)}>keep my record</button>
            <button className="door" onClick={onEraseAll}>
              erase
            </button>
          </span>
        ) : (
          <button className="door" onClick={() => setConfirmErase(true)}>delete…</button>
        )}
      </div>

      <div className="settings__row">
        <span className="settings__label">Medication</span>
        <span className="settings__value">
          {state.medication} · currently {fmtDose(currentDose(state))}
        </span>
      </div>

      <div className="settings__row">
        <span className="settings__label">Evening invitation</span>
        <select
          value={state.reminderHour}
          onChange={(e) => actions.setReminderHour(parseInt(e.target.value, 10))}
        >
          {[18, 19, 20, 21, 22].map(h => (
            <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 pm</option>
          ))}
          <option value={-1}>never — I'll come on my own</option>
        </select>
      </div>

      <div className="settings__row">
        <span className="settings__label">Appearance</span>
        <select value={state.theme} onChange={(e) => actions.setTheme(e.target.value)}>
          <option value="paper">paper</option>
          <option value="night">night</option>
        </select>
      </div>

      {state.routeHistory.length > 0 && (
        <div className="settings__row">
          <span className="settings__label">Roads not taken</span>
          <span className="settings__value">
            {state.routeHistory.length} earlier {state.routeHistory.length === 1 ? 'route' : 'routes'}, kept quietly
          </span>
        </div>
      )}

      <div className="inscription">
        {walked.toLocaleString()} days walked together.
      </div>
    </div>
  );
}
