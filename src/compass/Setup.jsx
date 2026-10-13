import Logo from './Logo.jsx';
import { PRESETS } from './presets.js';
import { freshState, projectFuture, firstCutOf, fmtDose, seasonOf } from './model.js';
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
  const chosen = PRESETS.find((x) => x.id === plan) || null;
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


      <form className="welcome__form" onSubmit={(e) => { e.preventDefault(); if (ok) onDone({ medication: medication.trim(), dose: doseNum, doseSchedule: SCHEDULES[times], routePlanned: plan !== 'record', strategy: chosen ? chosen.strategy(doseNum) : null }); }}>
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
          <legend>How would you like to start?</legend>
          <p className="welcome__fine welcome__fine--plain">
            These are drafts drawn from published tapering guidance, written for benzodiazepines.
            They’re starting points to review with your prescriber, not instructions, and you can
            change any of it later in Plan.
          </p>
          <label className={plan === 'record' ? 'is-picked' : ''}>
            <input type="radio" name="plan" value="record" checked={plan === 'record'} onChange={() => setPlan('record')} />
            <span>
              <strong>Just keep a record</strong>
              <em>No route drawn. Best if you aren’t changing your dose yet, or your prescriber already gave you a schedule — log each change as it happens.</em>
            </span>
          </label>
          {PRESETS.map((x) => {
            const strat = doseNum > 0 ? x.strategy(doseNum) : null;
            let figures = null;
            if (strat) {
              const temp = freshState({ medication: 'x', dose: doseNum, routePlanned: true, strategy: strat });
              const fut = projectFuture(temp, undefined, strat);
              figures = `First cut ${fmtDose(firstCutOf(temp, strat))}. ` + (
                fut.arrivalISO ? `Near zero around ${seasonOf(fut.arrivalISO)}.`
                : 'Near zero is beyond the four-year view at this pace.');
            }
            return (
              <label key={x.id} className={plan === x.id ? 'is-picked' : ''}>
                <input type="radio" name="plan" value={x.id} checked={plan === x.id} onChange={() => setPlan(x.id)} />
                <span>
                  <strong>{x.name}</strong> <span className="choice__line">— {x.line}</span>
                  <em>{x.why}</em>
                  {figures && <span className="choice__figures">{figures}</span>}
                  <a className="choice__source" href={x.source.url} target="_blank" rel="noreferrer">Source: {x.source.label}</a>
                </span>
              </label>
            );
          })}
          <p className="welcome__fine welcome__fine--plain">
            Much of tapering guidance rests on expert consensus rather than trial evidence, and
            it varies between sources. Your prescriber knows your situation.
          </p>
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
