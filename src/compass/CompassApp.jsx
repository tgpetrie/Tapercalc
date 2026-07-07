import React, { useEffect, useState } from 'react';
import {
  loadState, saveState, markDay, setWeather, setNote, commitStrategy,
  claimMilestones,
} from './model.js';
import Today from './Today.jsx';
import Celebration from './Celebration.jsx';
import Path from './Path.jsx';
import MapTable from './MapTable.jsx';
import Library from './Library.jsx';
import Settings from './Settings.jsx';
import './compass.css';

/**
 * Compass — one object, four altitudes.
 * Today (ground) · Path (hilltop) · Map table (a mode, not a place) ·
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

export default function CompassApp() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('today');
  const [planning, setPlanning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [librarySection, setLibrarySection] = useState(null);
  const [celebrating, setCelebrating] = useState(null);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    document.documentElement.dataset.mode = planning ? 'planning' : 'living';
  }, [planning]);

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
    setReminderHour: (h) => setState(s => ({ ...s, reminderHour: h })),
    setTheme: (t) => setState(s => ({ ...s, theme: t })),
    openSupport: () => {
      setPlanning(false);
      setSettingsOpen(false);
      setLibrarySection('support');
      setTab('library');
    },
  };

  let surface;
  if (planning) {
    surface = <MapTable state={state} actions={actions} onClose={() => setPlanning(false)} />;
  } else if (settingsOpen) {
    surface = <Settings state={state} actions={actions} onClose={() => setSettingsOpen(false)} />;
  } else if (tab === 'today') {
    surface = (
      <>
        <TodaySliver state={state} />
        <Today state={state} actions={actions} />
      </>
    );
  } else if (tab === 'path') {
    surface = <Path state={state} onOpenPlanning={() => setPlanning(true)} />;
  } else {
    surface = <Library openSection={librarySection} onOpenSection={setLibrarySection} />;
  }

  return (
    <div className="compass">
      {surface}

      {celebrating && (
        <Celebration
          state={state}
          milestone={celebrating}
          onDone={() => setCelebrating(null)}
        />
      )}

      {!planning && !settingsOpen && (
        <nav className="tabbar" aria-label="Compass">
          {[['today', 'Today'], ['path', 'Path'], ['library', 'Library']].map(([id, label]) => (
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
