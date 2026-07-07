import React, { useRef, useState } from 'react';
import {
  DIALS, todayISO, fmtDose, dayNumber, currentDose, activeHold,
  nextChange, weekdayName, prettyDate, gapLength, stormyRun,
} from './model.js';

/**
 * Today — ground level. One purpose: receive the day's mark.
 * The screen is a sentence, not a layout.
 */

function composeSentence(state) {
  const hour = new Date().getHours();
  const dose = currentDose(state);
  const hold = activeHold(state);
  const next = nextChange(state);

  const doseLine =
    hour < 12 ? `${fmtDose(dose)} this morning.` : `${fmtDose(dose)}, same as yesterday.`;

  let phaseLine = '';
  if (hold) {
    phaseLine = `Hold week — nothing changes until ${weekdayName(hold.endsOn)}.`;
  } else if (next) {
    const inDays = Math.max(0, Math.round((new Date(next.date) - new Date()) / 86400000));
    phaseLine =
      inDays <= 0 ? `Today is a step day — down to ${fmtDose(next.dose)}.`
      : inDays <= 3 ? `A step down is coming ${weekdayName(next.date)}.`
      : `Steady until ${prettyDate(next.date)}, then ${fmtDose(next.dose)}.`;
  } else {
    phaseLine = 'Steady. Nothing changes today.';
  }
  return { doseLine, phaseLine };
}

/** The daymark: press and hold. Release early, and nothing happens. */
function Daymark({ marked, onMark }) {
  const [holding, setHolding] = useState(false);
  const [sealed, setSealed] = useState(false); // marked just now, this visit
  const timer = useRef(null);

  const begin = (e) => {
    if (marked) return;
    e.preventDefault();
    setHolding(true);
    timer.current = setTimeout(() => {
      navigator.vibrate?.(30);
      setSealed(true);
      onMark();
      setHolding(false);
    }, DIALS.DAYMARK_HOLD_MS);
  };

  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <div>
      <button
        className={`daymark ${holding ? 'is-holding' : ''} ${marked ? 'is-marked' : ''}`}
        style={{ '--hold-ms': `${DIALS.DAYMARK_HOLD_MS}ms` }}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !marked && !e.repeat) begin(e); }}
        onKeyUp={cancel}
        aria-label={marked ? 'Day marked' : 'Press and hold to mark the day'}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle className="daymark__ring" cx="32" cy="32" r="30" />
          <circle className="daymark__fill" cx="32" cy="32" r="28" />
        </svg>
        {sealed && (
          <span className="daymark__ripplewrap" aria-hidden="true">
            <span className="daymark__ripple" />
            <span className="daymark__ripple" />
          </span>
        )}
      </button>
      {!marked && <div className="daymark__hint">hold to mark the day</div>}
    </div>
  );
}

export default function Today({ state, actions }) {
  const iso = todayISO();
  const entry = state.journal[iso] || {};
  const marked = !!entry.marked;
  const { doseLine, phaseLine } = composeSentence(state);
  const day = dayNumber(state);
  const gap = gapLength(state);
  const evening = new Date().getHours() >= 18;
  const roughStretch = stormyRun(state) >= DIALS.STORMY_RUN_LENGTH;
  const [noteOpen, setNoteOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const showWeather = weatherOpen || (evening && marked && !entry.weather);

  return (
    <div className="page">
      <div className="today">
        {gap >= DIALS.GAP_SENTENCE_AFTER_DAYS && !marked && (
          <div className="welcome-back">Welcome back. Picking up from today.</div>
        )}

        <div className="today__sentence voice">
          <div className="voice--day">Day {day}</div>
          {marked ? (
            <div className="marked-sentence">
              <p className="quiet">Marked.</p>
              <p className="quiet">{evening ? 'Rest well.' : 'See you tomorrow.'}</p>
            </div>
          ) : (
            <>
              <p>{doseLine}</p>
              <p className="quiet">{phaseLine}</p>
            </>
          )}
        </div>

        <Daymark marked={marked} onMark={actions.markToday} />

        {showWeather && (
          <div>
            {evening && marked && !entry.weather && (
              <p className="voice quiet" style={{ fontSize: '1rem' }}>How did today sit with you?</p>
            )}
            <div className="weather-row">
              {DIALS.WEATHER_WORDS.map((w) => (
                <button
                  key={w}
                  className={`weather-word ${entry.weather === w ? 'is-chosen' : ''}`}
                  onClick={() => actions.setWeather(entry.weather === w ? null : w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {noteOpen && (
          <input
            className="note-field"
            autoFocus
            placeholder="one line, if you want it"
            defaultValue={entry.note || ''}
            onBlur={(e) => actions.setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          />
        )}

        <div className="margin-row" style={{ marginTop: '1.6rem' }}>
          {!showWeather && (
            <button className="margin-link" onClick={() => setWeatherOpen(true)}>weather</button>
          )}
          {!noteOpen && (
            <button className="margin-link" onClick={() => setNoteOpen(true)}>note</button>
          )}
        </div>

        {roughStretch && (
          <div className="rough-stretch">
            Rough stretch. The Library has a page on waves, and support is a tap away.
          </div>
        )}

        <div className="support-line">
          <button className="margin-link" onClick={actions.openSupport}>
            Need steadying? →
          </button>
        </div>
      </div>
    </div>
  );
}
