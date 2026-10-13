import React, { useEffect, useState } from 'react';
import {
  loadGuestState, saveGuestState, getGuestMode, setGuestMode, eraseGuest,
  freshState, sampleState, markDay, setWeather, setNote, commitStrategy,
  claimMilestones, setMedication, setDoseSchedule, editOrigin,
  adjustDoseToday, addRestPoint, pauseRoute, resumeRoute,
} from './model.js';
import Today from './Today.jsx';
import Celebration from './Celebration.jsx';
import Path from './Path.jsx';
import MapTable from './MapTable.jsx';
import Library from './Library.jsx';
import Settings from './Settings.jsx';
import HardDay from './HardDay.jsx';
import Logo from './Logo.jsx';
import SharedView from './SharedView.jsx';
import './install.js';
import Welcome from './Welcome.jsx';
import Setup from './Setup.jsx';
import {
  getSession, onAuthChange, signOut, loadCloudState, saveCloudState, deleteCloudState,
} from './auth.js';
import './compass.css';

/**
 * Compass — one object, four altitudes.
 * Today (ground) · Path (hilltop) · Plan (the map table) ·
 * Library (the pack) · Settings (a door).
 */

/** The thin sliver of the Line on desktop Today — ground level stays connected. */
function TodaySliver() {
  const x = 30;
  return (
    <div className="today-sliver" aria-hidden="true">
      <svg viewBox="0 0 60 400" width="60" height="100%">
        <line x1={x} y1="0" x2={x} y2="200" stroke="var(--ink)" strokeWidth="2" opacity="0.55" />
        <line x1={x} y1="200" x2={x} y2="400" stroke="var(--pencil)"
          strokeWidth="1.6" strokeDasharray="3 5" />
        <circle cx={x} cy="200" r="5" fill="var(--accent)" />
      </svg>
    </div>
  );
}

/** Text size is also kept on the device so the welcome page honors it before sign-in. */
function applyTextSize(size) {
  document.documentElement.dataset.text = size;
  try { localStorage.setItem('compass.text.v1', size); } catch { /* ignore */ }
}
(function restoreTextSize() {
  try {
    const saved = localStorage.getItem('compass.text.v1');
    if (saved) document.documentElement.dataset.text = saved;
  } catch { /* ignore */ }
})();

/**
 * The route itself. `identity` is { kind: 'guest' | 'user', userId?, email? };
 * guests persist to this device, accounts to the cloud (debounced).
 */
function Compass({ initialState, identity, onAccount, onSignOut, onEraseAll, onHome, onSignIn }) {
  const [state, setState] = useState(initialState);
  const [syncError, setSyncError] = useState(false);
  const [hardDayOpen, setHardDayOpen] = useState(false);
  const [tab, setTab] = useState('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [librarySection, setLibrarySection] = useState(null);
  const [celebrating, setCelebrating] = useState(null);

  useEffect(() => {
    if (identity.kind === 'sample') return undefined;   // a sample is never saved
    if (identity.kind === 'guest') { saveGuestState(state); return undefined; }
    const t = setTimeout(() => {
      saveCloudState(identity.userId, state)
        .then(() => setSyncError(false))
        .catch(() => setSyncError(true));
    }, 700);
    return () => clearTimeout(t);
  }, [state, identity]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => { applyTextSize(state.textSize || 'normal'); }, [state.textSize]);

  // each screen starts at its top
  useEffect(() => { window.scrollTo(0, 0); }, [tab, settingsOpen, hardDayOpen]);

  useEffect(() => {
    document.documentElement.dataset.mode = tab === 'plan' ? 'planning' : 'living';
  }, [tab]);

  const actions = {
    markToday: () => {
      // computed outside the updater: claiming has a side effect (the moment)
      const { state: next, milestone } = claimMilestones(markDay(state));
      setState(next);
      if (milestone) {
        // let the daymark's ink settle before the moment begins
        setTimeout(() => setCelebrating(milestone), 900);
      }
    },
    setWeather: (w) => setState(s => setWeather(s, w)),
    setNote: (n) => setState(s => setNote(s, n)),
    commitStrategy: (strat) => setState(s => commitStrategy(s, strat)),
    setMedication: (name) => setState(s => setMedication(s, name)),
    setDoseSchedule: (times) => setState(s => setDoseSchedule(s, times)),
    editOrigin: (patch) => setState(s => editOrigin(s, patch)),
    adjustDoseToday: (mg) => setState(s => adjustDoseToday(s, mg)),
    addRestPoint: (days) => setState(s => addRestPoint(s, days)),
    pauseRoute: () => setState(s => pauseRoute(s)),
    resumeRoute: () => setState(s => resumeRoute(s)),
    setReminderHour: (h) => setState(s => ({ ...s, reminderHour: h })),
    setTheme: (t) => setState(s => ({ ...s, theme: t })),
    setTextSize: (t) => setState(s => ({ ...s, textSize: t })),
    openHardDay: () => setHardDayOpen(true),
    openSupport: () => {
      setSettingsOpen(false);
      setLibrarySection('support');
      setTab('library');
    },
  };

  let surface;
  if (hardDayOpen) {
    surface = (
      <HardDay
        onClose={() => setHardDayOpen(false)}
        onRead={() => { setHardDayOpen(false); setLibrarySection('waves'); setTab('library'); }}
        onSupport={() => { setHardDayOpen(false); setLibrarySection('support'); setTab('library'); }}
      />
    );
  } else if (settingsOpen) {
    surface = <Settings state={state} actions={actions} identity={identity} syncError={syncError}
        onAccount={onAccount} onSignOut={onSignOut} onEraseAll={onEraseAll}
        onClose={() => setSettingsOpen(false)} />;
  } else if (tab === 'today') {
    surface = (
      <>
        <TodaySliver state={state} />
        <Today state={state} actions={actions} />
      </>
    );
  } else if (tab === 'path') {
    surface = <Path state={state} onOpenPlanning={() => setTab('plan')} />;
  } else if (tab === 'plan') {
    surface = <MapTable state={state} actions={actions} />;
  } else {
    surface = <Library state={state} openSection={librarySection} onOpenSection={setLibrarySection} />;
  }

  return (
    <div className="compass">
      <header className="appbar">
        <button className="appbar__home" onClick={onHome} aria-label="Compass home">
          <Logo size={30} />
          <span>Compass</span>
        </button>
        {identity.kind === 'user' ? (
          <button className="appbar__account" onClick={() => setSettingsOpen(true)} aria-label="Account and settings">
            {(identity.email || '?').slice(0, 1).toUpperCase()}
          </button>
        ) : (
          <button className="appbar__signin" onClick={onSignIn}>
            {identity.kind === 'sample' ? 'Leave sample' : 'Sign in'}
          </button>
        )}
      </header>

      {surface}

      {celebrating && (
        <Celebration
          state={state}
          milestone={celebrating}
          onDone={() => setCelebrating(null)}
        />
      )}

      {!settingsOpen && !hardDayOpen && (
        <nav className="tabbar" aria-label="Compass">
          {[['today', 'Today'], ['path', 'Path'], ['plan', 'Plan'], ['library', 'Library']].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? 'is-active' : ''}
              onClick={() => { setTab(id); if (id !== 'library') setLibrarySection(null); }}
            >
              {label}
            </button>
          ))}
          <button
            className="tabbar__settings"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            ◦
          </button>
        </nav>
      )}
    </div>
  );
}

/**
 * The front door. Decides, before anything of anyone's route is shown,
 * whether this is a visitor (welcome), a new route (setup), or a returning
 * guest or account (their own record).
 */
function CompassGate() {
  // phase: loading | welcome | recovery | setup | app
  const [phase, setPhase] = useState('loading');
  const [identity, setIdentity] = useState(null);
  const [state, setState] = useState(null);
  const [notice, setNotice] = useState('');
  const [welcomeMode, setWelcomeMode] = useState('home');

  const enterGuest = (existing) => {
    setGuestMode(true);
    setIdentity({ kind: 'guest' });
    const have = existing || loadGuestState();
    if (have) { setState(have); setPhase('app'); } else { setPhase('setup'); }
  };

  const enterUser = async (session) => {
    const user = { kind: 'user', userId: session.user.id, email: session.user.email };
    try {
      let cloud = await loadCloudState(user.userId);
      if (!cloud) {
        // First sign-in: bring a guest route along if there is one, else start fresh.
        const guest = loadGuestState();
        if (guest && !guest.sample) {
          await saveCloudState(user.userId, guest);
          eraseGuest();
          cloud = guest;
        }
      }
      setGuestMode(false);
      setIdentity(user);
      if (cloud) { setState(cloud); setPhase('app'); } else { setPhase('setup'); }
    } catch {
      setNotice('We couldn’t load your route just now. Check your connection and sign in again.');
      await signOut();
      setPhase('welcome');
    }
  };

  useEffect(() => {
    let alive = true;
    let handled = null;
    const take = (session) => {
      if (!alive || !session || handled === session.user.id) return;
      handled = session.user.id;
      enterUser(session);
    };
    const off = onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { handled = null; setPhase('recovery'); return; }
      if (event === 'SIGNED_OUT') { handled = null; return; }
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') take(session);
    });
    getSession().then((session) => {
      if (!alive) return;
      if (session) take(session);
      else if (getGuestMode()) enterGuest();
      else setPhase('welcome');
    });
    return () => { alive = false; off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state) document.documentElement.dataset.theme = 'paper';
  }, [state]);

  useEffect(() => { window.scrollTo(0, 0); }, [phase, welcomeMode]);

  const finishSetup = (answers) => {
    const fresh = freshState(answers);
    setState(fresh);
    setPhase('app');
  };

  // Back to the front door without losing the route in memory: "Continue" returns to it.
  const goHome = (mode = 'home') => {
    setNotice('');
    setWelcomeMode(mode);
    setPhase('welcome');
  };

  // Leaving for good (sign out, leave a sample): the route is let go of.
  const leaveToWelcome = () => {
    setGuestMode(false);
    setState(null); setIdentity(null); setNotice('');
    setWelcomeMode('home');
    setPhase('welcome');
  };

  const resumeKind = state && identity && identity.kind !== 'sample' ? identity.kind : null;

  if (phase === 'loading') return <div className="compass" aria-busy="true" />;

  if (phase === 'recovery') {
    return <div className="compass"><Welcome initialMode="reset" /></div>;
  }

  if (phase === 'welcome') {
    return (
      <div className="compass">
        <Welcome
          key={welcomeMode + (resumeKind || '')}
          initialMode={welcomeMode}
          resume={resumeKind}
          onResume={() => setPhase('app')}
          notice={notice}
          onGuest={() => enterGuest(resumeKind === 'guest' ? state : undefined)}
          onSample={() => {
            setGuestMode(false);
            setIdentity({ kind: 'sample' });
            setState(sampleState());
            setPhase('app');
          }}
        />
      </div>
    );
  }

  if (phase === 'setup') {
    return <div className="compass"><Setup identity={identity.kind} onDone={finishSetup} /></div>;
  }

  // A sample route is never saved anywhere; leaving it returns to the welcome page.
  return (
    <Compass
      key={identity.userId || identity.kind}
      initialState={state}
      identity={identity}
      onAccount={() => goHome('signin')}
      onHome={() => goHome('home')}
      onSignIn={() => (identity.kind === 'sample' ? leaveToWelcome() : goHome('signin'))}
      onSignOut={async () => { await signOut(); leaveToWelcome(); }}
      onEraseAll={async () => {
        if (identity.kind === 'user') { try { await deleteCloudState(identity.userId); } catch { /* shown by reload */ } }
        eraseGuest();
        window.location.reload();
      }}
    />
  );
}

export default function CompassApp() {
  const token = new URLSearchParams(window.location.search).get('share');
  if (token) return <SharedView token={token} />;
  return <CompassGate />;
}
