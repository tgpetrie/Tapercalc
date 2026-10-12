import React, { useEffect, useState } from 'react';
import { canPromptInstall, promptInstall, isStandalone, isIOS, downloadReminder } from './install.js';
import { getShare, createShare, deleteShare } from './auth.js';
import { daysWalked, fmtDose, currentDose, exportEverything } from './model.js';

/**
 * Settings — a door, not a destination. One flat list.
 * Data dignity is a headline here, not fine print.
 */

function InstallRow() {
  const [, bump] = useState(0);
  if (isStandalone()) return null;
  const native = canPromptInstall();
  return (
    <div className="settings__row">
      <span className="settings__label">Keep Compass on your home screen</span>
      {native ? (
        <button className="door" onClick={async () => { await promptInstall(); bump(n => n + 1); }}>add</button>
      ) : (
        <span className="settings__value">
          {isIOS()
            ? 'Tap the Share button, then “Add to Home Screen”.'
            : 'Open your browser’s menu, then choose “Add to Home screen” or “Install app”.'}
        </span>
      )}
    </div>
  );
}

function ShareRow({ userId }) {
  const [share, setShare] = useState(undefined); // undefined = loading, null = none
  const [includeNotes, setIncludeNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getShare(userId).then((s) => alive && setShare(s)).catch(() => alive && setShare(null));
    return () => { alive = false; };
  }, [userId]);

  const url = share ? `${window.location.origin}/?share=${share.token}` : '';
  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch { setError('That didn’t work just now. Please try again.'); }
    setBusy(false);
  };

  return (
    <div className="settings__block">
      <div className="settings__label">A trusted person can see your summary</div>
      <p className="settings__value">
        A private link to a read-only, one-page summary — doses, dates and how the days felt.
        {' '}Anyone with the link can see it, so share it only with someone you trust. You can stop any time.
      </p>
      {share === undefined ? null : share ? (
        <>
          <input className="settings__linkbox" readOnly value={url} aria-label="Your private link"
            onFocus={(e) => e.target.select()} />
          <p className="settings__value">
            {share.include_notes ? 'Your daily notes are included.' : 'Your daily notes are not included.'}
          </p>
          <div className="settings__actions">
            <button className="door" onClick={() => navigator.clipboard?.writeText(url)}>copy link</button>
            <button className="door" disabled={busy}
              onClick={() => run(async () => { await deleteShare(userId); setShare(null); })}>stop sharing</button>
          </div>
        </>
      ) : (
        <>
          <label className="summary__check">
            <input type="checkbox" checked={includeNotes} onChange={(e) => setIncludeNotes(e.target.checked)} />
            <span>include my daily notes</span>
          </label>
          <div className="settings__actions">
            <button className="door" disabled={busy}
              onClick={() => run(async () => setShare(await createShare(userId, includeNotes)))}>
              create a private link
            </button>
          </div>
        </>
      )}
      {error && <p className="welcome__error" role="alert">{error}</p>}
    </div>
  );
}

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

      {state.reminderHour >= 0 && (
        <div className="settings__row">
          <span className="settings__label">Remind me every day</span>
          <button className="door" onClick={() => downloadReminder(state.reminderHour)}>add to my calendar</button>
        </div>
      )}

      <InstallRow />

      {identity.kind === 'user' && <ShareRow userId={identity.userId} />}

      <div className="settings__row">
        <span className="settings__label">Text size</span>
        <select value={state.textSize || 'normal'} onChange={(e) => actions.setTextSize(e.target.value)}>
          <option value="normal">standard</option>
          <option value="large">large</option>
          <option value="larger">largest</option>
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
