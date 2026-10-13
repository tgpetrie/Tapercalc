import Logo from './Logo.jsx';
import { CLASSES, classify, SAMHSA } from './drugClasses.js';
import { freshState, projectFuture, firstCutOf, fmtDose, seasonOf } from './model.js';
import React, { useState } from 'react';

/**
 * Setup — plain questions before anything is drawn.
 * What Compass offers depends on what published guidance exists for the kind
 * of medication, and on whether it was prescribed. Where stopping alone can be
 * dangerous, or the use isn't prescribed, it offers support instead of a route.
 */
const SCHEDULES = {
  morning: ['morning'], evening: ['evening'],
  twice: ['morning', 'evening'], thrice: ['morning', 'midday', 'evening'],
};

function Support({ children }) {
  return (
    <div className="setup__notice" role="note">
      {children}
      <p>
        Free, confidential help, any time: <a href={SAMHSA.tel}>{SAMHSA.phone}</a> ({SAMHSA.label}),{' '}
        <a href={SAMHSA.url} target="_blank" rel="noreferrer">samhsa.gov</a>.
        In an emergency, call your local emergency number.
      </p>
    </div>
  );
}

export default function Setup({ onDone, identity }) {
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const [times, setTimes] = useState('morning');
  const [prescribed, setPrescribed] = useState('');
  const [override, setOverride] = useState('');
  const [plan, setPlan] = useState('');

  const doseNum = parseFloat(dose);
  const detected = classify(medication);
  const classId = override || detected || (medication.trim().length >= 3 ? 'other' : null);
  const cls = classId ? CLASSES[classId] : null;
  const supervised = cls?.level === 'supervised';
  const notPrescribed = prescribed === 'no';
  const presets = !cls || notPrescribed ? [] : (cls.presets || []);
  const chosen = presets.find((x) => x.id === plan) || null;
  const ok = !supervised && medication.trim().length > 0 && doseNum > 0 && prescribed !== '' && plan !== '';

  const pickClass = (v) => { setOverride(v); setPlan(''); };

  const submit = (e) => {
    e.preventDefault();
    if (!ok) return;
    onDone({
      medication: medication.trim(), dose: doseNum, doseSchedule: SCHEDULES[times],
      drugClass: classId, routePlanned: plan !== 'record',
      strategy: chosen ? chosen.strategy(doseNum) : null,
    });
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

      <form className="welcome__form" onSubmit={submit}>
        <label className="welcome__field">
          <span>Medication or substance</span>
          <input type="text" required value={medication} placeholder="For example, as written on your prescription"
            onChange={(e) => { setMedication(e.target.value); setPlan(''); }} />
        </label>

        {cls && (
          <label className="welcome__field">
            <span>
              {override ? 'Type of medication' : detected ? `This looks like: ${cls.label}. Not right?` : 'What kind is it?'}
            </span>
            <select value={override || classId} onChange={(e) => pickClass(e.target.value)}>
              {Object.entries(CLASSES).map(([id, c]) => (
                <option key={id} value={id}>{id === 'other' ? 'Something else / not sure' : c.label}</option>
              ))}
            </select>
          </label>
        )}

        {supervised ? (
          <Support>
            <p><strong>Please don’t cut down alcohol on your own with a plan from an app.</strong></p>
            <p>
              Stopping or cutting back sharply after heavy, regular drinking can cause serious
              withdrawal, including seizures, and is best done with medical supervision. A
              doctor or a treatment service can help you do it safely.
            </p>
            <p>
              <a href={cls.source.url} target="_blank" rel="noreferrer">{cls.source.label}</a>
            </p>
            <p>If this isn’t what you meant, change the medication or type above.</p>
          </Support>
        ) : (
          <>
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
              <legend>Was it prescribed to you?</legend>
              {[['yes', 'Yes, a prescriber gave it to me'], ['no', 'No, or not in the way it was prescribed']].map(([v, t]) => (
                <label key={v} className={prescribed === v ? 'is-picked' : ''}>
                  <input type="radio" name="prescribed" value={v} checked={prescribed === v}
                    onChange={() => { setPrescribed(v); setPlan(''); }} />
                  <span><strong>{t}</strong></span>
                </label>
              ))}
            </fieldset>

            {notPrescribed && (
              <Support>
                <p>
                  Compass won’t draw a taper for medicine that wasn’t prescribed to you, because
                  stopping can carry risks that a doctor needs to weigh. Support exists that
                  doesn’t judge, and you can still keep a private record here.
                </p>
              </Support>
            )}

            {cls && prescribed !== '' && (
              <fieldset className="welcome__choices">
                <legend>How would you like to start?</legend>
                {!notPrescribed && cls.intro && <p className="welcome__fine welcome__fine--plain">{cls.intro}</p>}
                {!notPrescribed && cls.caution && <p className="welcome__fine welcome__fine--plain">{cls.caution}</p>}
                <label className={plan === 'record' ? 'is-picked' : ''}>
                  <input type="radio" name="plan" value="record" checked={plan === 'record'} onChange={() => setPlan('record')} />
                  <span>
                    <strong>Just keep a record</strong>
                    <em>No route drawn. Best if you aren’t changing your dose yet, or your prescriber already gave you a schedule — log each change as it happens.</em>
                  </span>
                </label>
                {presets.map((x) => {
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
                {presets.length > 0 && (
                  <p className="welcome__fine welcome__fine--plain">
                    These are drafts drawn from published guidance, starting points to review with
                    your prescriber, not instructions. Much of tapering guidance rests on expert
                    consensus rather than trial evidence, and it varies between sources.
                  </p>
                )}
              </fieldset>
            )}
          </>
        )}

        {!supervised && <button className="door door--primary" type="submit" disabled={!ok}>Continue</button>}
      </form>

      <footer className="welcome__fine">
        <p>
          Compass covers benzodiazepines, opioid pain medicines, antidepressants and gabapentinoids
          with published guidance, stimulants with a labelled draft only, and keeps a plain record
          for anything else. Ask your prescriber what applies to you.
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
