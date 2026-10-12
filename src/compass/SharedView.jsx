import Logo from './Logo.jsx';
import React, { useEffect, useState } from 'react';
import { loadSharedSummary } from './auth.js';
import { migrate } from './model.js';
import Summary from './Summary.jsx';

/** What a trusted person sees: the summary, read-only, no sign-in. */
export default function SharedView({ token }) {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let alive = true;
    loadSharedSummary(token).then((d) => alive && setData(d || null)).catch(() => alive && setData(null));
    return () => { alive = false; };
  }, [token]);

  if (data === undefined) return <div className="compass" aria-busy="true" />;
  if (!data) {
    return (
      <div className="compass"><main className="page welcome">
        <div className="welcome__brand"><Logo size={44} animate /><span className="welcome__mark">Compass</span></div>
        <h1 className="welcome__title">This link isn’t active.</h1>
        <p className="welcome__lede">
          The person who shared it may have stopped sharing. Ask them for a new link if you need one.
        </p>
      </main></div>
    );
  }

  const state = migrate({
    version: 1,
    medication: data.medication,
    startDate: data.startDate,
    events: data.events,
    journal: data.journal,
    strategy: {},
  });
  return (
    <div className="compass">
      <main className="page">
        <p className="summary__shared">
          Shared with you, read-only. It updates as they use Compass
          {data.updatedAt ? ` · last updated ${new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.
        </p>
        <Summary state={state} readOnly sharedNotes={data.includeNotes} />
        <div className="summary__controls">
          <button className="door" onClick={() => window.print()}>print this page</button>
        </div>
      </main>
    </div>
  );
}
