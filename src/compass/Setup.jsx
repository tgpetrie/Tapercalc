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
  const [times, setTimes] = useState('morning');
  const [plan, setPlan] = useState('');
  const doseNum = parseFloat(dose);
  const ok = medication.trim().length > 0 && doseNum > 0 && plan !== '';
  const SCHEDULES = {
    morning: ['morning'], evening: ['evening'],
    twice: ['morning', 'evening'], thrice: ['morning', 'midday', 'evening'],
  };

  return (
    <main className="page welcome welcome--sub">
      <header className="welcome__brand"><Logo size={40} /><span className="welcome__mark">Compass</span></header>
      <section className="welcome__intro">
        <h1 className="welcome__title">Where are you setting out from?</h1>
        <p className="welcome__lede">
          A few questions first, so Compass starts from your real situation. You can change
          any of this later.
        </p>
      </section>


      <form className="welcome__form" onSubmit={(e) => { e.preventDefault(); if (ok) onDone({ medication: medication.trim(), dose: doseNum, doseSchedule: SCHEDULES[times], routePlanned: plan === 'draft' }); }}>
        <label className="welcome__field">
          <span>Medication</span>
          <input type="text" required value={medication} placeholder="As written on your prescription"
            onChange={(e) => setMedication(e.target.value)} />
        </label>
        <label className="welcome__field">
          <span>Your dose today, in mg</span>
          <input type="number" inputMode="decimal" min="0" step="any" required value={dose}
            onChange={(e) => setDose(e.target.value)} />
        </label>
        <label className="welcome__field">
          <span>How do you take it?</span>
          <select value={times} onChange={(e) => setTimes(e.target.value)}>
            <option value="morning">Once a day, in the morning</option>
            <option value="evening">Once a day, in the evening</option>
            <option value="twice">Twice a day</option>
            <option value="thrice">Three times a day</option>
          </select>
        </label>
        <fieldset className="welcome__choices">
          <legend>What would you like Compass to do?</legend>
          <label className={plan === 'record' ? 'is-picked' : ''}>
            <input type="radio" name="plan" value="record" checked={plan === 'record'} onChange={() => setPlan('record')} />
            <span><strong>Keep a record.</strong> No changes drawn. Best if you aren’t changing your dose yet, or your prescriber already gave you a schedule — log each change as it happens.</span>
          </label>
          <label className={plan === 'draft' ? 'is-picked' : ''}>
            <input type="radio" name="plan" value="draft" checked={plan === 'draft'} onChange={() => setPlan('draft')} />
            <span><strong>Show me a draft route.</strong> A sketch of gradual reductions to talk over with your prescriber. It is arithmetic, not a recommendation.</span>
          </label>
        </fieldset>
        <button className="door door--primary" type="submit" disabled={!ok}>Continue</button>
      </form>

      <footer className="welcome__fine">
        <p>
          Compass’s reading in the Library is mostly about benzodiazepine tapers. Other
          medications work differently, so ask your prescriber what applies to yours.
        </p>
        <p>
          {identity === 'guest'
            ? 'Saved on this device only. You can create an account later from Settings.'
            : 'Saved to your account, so it follows you to any device.'}
        </p>
      </footer>
    </main>
  );
}
