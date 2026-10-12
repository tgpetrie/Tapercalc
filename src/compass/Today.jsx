import WeatherIcon from './WeatherIcon.jsx';
import React, { useRef, useState } from 'react';
import {
  DIALS, todayISO, fmtDose, dayNumber, currentDose, activeHold,
  nextChange, weekdayName, prettyDate, gapLength, stormyRun,
} from './model.js';

/**
 * Today — ground level. One purpose: receive the day's mark.
 * The screen is a sentence, not a layout. After the mark, the day's
 * weather and note wait quietly below — a field journal, never a form.
 */

function composeSentence(state) {
  const hour = new Date().getHours();
  const dose = currentDose(state);
  const hold = activeHold(state);
  const next = nextChange(state);

  const doseLine =
    hour < 12 ? `${fmtDose(dose)} this morning.` : `${fmtDose(dose)}, same as yesterday.`;

  let phaseLine = '';
  if (state.pausedSince) {
    phaseLine = 'Paused — the route waits. Resume from the map table whenever you’re ready.';
  } else if (hold) {
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
          <circle className="daymark__paper" cx="32" cy="32" r="29" />
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
      {!marked && (
        <button
          type="button"
          className="margin-link daymark__alt"
          onClick={() => { setSealed(true); onMark(); }}
        >
          or mark today with one tap
        </button>
      )}
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

  // the day's record waits below the mark — visible once the day is
  // sealed, or when the person reaches for it early
  const showWeather = marked || weatherOpen || !!entry.weather;
  const showNote = marked || noteOpen || !!entry.note;

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
              <p className="marked-primary">Marked.</p>
              <p className="marked-secondary">{evening ? 'Rest well.' : 'See you tomorrow.'}</p>
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
          <div className="day-section">
            <div className="day-section__label">Today’s weather</div>
            <div className="weather-row">
              {DIALS.WEATHER_WORDS.map((w) => (
                <button
                  key={w}
                  className={`weather-word ${entry.weather === w ? 'is-chosen' : ''}`}
                  onClick={() => actions.setWeather(entry.weather === w ? null : w)}
                >
                  <WeatherIcon kind={w} size={36} />
                  <span>{w}</span>
                </button>
              ))}
            </div>
            {!entry.weather && (
              <div className="day-section__hint">A simple way to mark how the day felt.</div>
            )}
          </div>
        )}

        {showNote && (
          <div className="day-section">
            <div className="day-section__label">Today’s note</div>
            {noteOpen ? (
              <div className="note-panel">
                <textarea
                  className="note-field"
                  autoFocus
                  rows={3}
                  placeholder="a few lines, if you want them — this stays with today"
                  defaultValue={entry.note || ''}
                  onBlur={(e) => { actions.setNote(e.target.value); setNoteOpen(false); }}
                />
                <div className="note-panel__hint">saved when you tap away · kept with Day {day}</div>
              </div>
            ) : entry.note ? (
              <>
                <div className="note-display">{entry.note}</div>
                <div className="day-section__tools">
                  <button className="margin-link" onClick={() => setNoteOpen(true)}>edit note</button>
                </div>
              </>
            ) : (
              <div className="day-section__tools">
                <button className="margin-link" onClick={() => setNoteOpen(true)}>add a note</button>
              </div>
            )}
          </div>
        )}

        {!showWeather && !showNote && (
          <div className="margin-row" style={{ marginTop: '1.6rem' }}>
            <button className="margin-link" onClick={() => setWeatherOpen(true)}>weather</button>
            <button className="margin-link" onClick={() => setNoteOpen(true)}>note</button>
          </div>
        )}

        {roughStretch && (
          <div className="rough-stretch">
            Rough stretch. The Library has a page on waves, and support is a tap away.
          </div>
        )}

        <div className="support-line">
          <button className="margin-link" onClick={actions.openHardDay}>
            Having a hard day?
          </button>
          <span aria-hidden="true"> · </span>
          <button className="margin-link" onClick={actions.openSupport}>
            Need support? →
          </button>
        </div>
      </div>
    </div>
  );
}
