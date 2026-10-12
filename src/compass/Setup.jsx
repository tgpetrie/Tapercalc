import Logo from './Logo.jsx';
import React, { useState } from 'react';

/**
 * Setup — three plain questions before the first route is drawn.
 * Whatever is entered here is the person's own; nothing is pre-filled
 * with someone else's numbers.
 */
export default function Setup({ onDone, identity }) {
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const doseNum = parseFloat(dose);
  const ok = medication.trim().length > 0 && doseNum > 0;

  return (
    <main className="page welcome">
      <div className="welcome__brand"><Logo size={44} animate /><span className="welcome__mark">Compass</span></div>
      <h1 className="welcome__title">Where are you setting out from?</h1>
      <p className="welcome__lede">
        Two things to start. You can change either later, and the route is only a draft
        until you decide otherwise.
      </p>

      <ol className="welcome__how">
        <li><strong>Mark the day.</strong> Once a day, hold the circle (or tap the button under it).</li>
        <li><strong>See the path.</strong> Ink shows where you’ve been; pencil is a gentle guess ahead.</li>
        <li><strong>Redraw any time.</strong> You decide changes with your prescriber — Compass just keeps the record.</li>
      </ol>

      <form className="welcome__form" onSubmit={(e) => { e.preventDefault(); if (ok) onDone({ medication: medication.trim(), dose: doseNum }); }}>
        <label className="welcome__field">
          <span>Medication</span>
          <input type="text" required value={medication} placeholder="the name on your prescription"
            onChange={(e) => setMedication(e.target.value)} />
        </label>
        <label className="welcome__field">
          <span>Your dose today, in mg</span>
          <input type="number" inputMode="decimal" min="0" step="any" required value={dose}
            onChange={(e) => setDose(e.target.value)} />
        </label>
        <button className="door door--primary" type="submit" disabled={!ok}>draw my route</button>
      </form>

      <p className="welcome__fine">
        {identity === 'guest'
          ? 'Saved on this device only. You can create an account later from Settings.'
          : 'Saved to your account, so it follows you to any device.'}
      </p>
    </main>
  );
}
