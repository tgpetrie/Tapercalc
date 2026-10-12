import React from 'react';

/**
 * HardDay — one calm page. Nothing to fill in, nothing to decide.
 * The route waits; the people are a tap away.
 */
export default function HardDay({ onClose, onRead, onSupport }) {
  return (
    <div className="page hardday">
      <button className="back-link" onClick={onClose}>← back</button>
      <h1>A hard day.</h1>
      <p className="hardday__lede">
        You don’t have to do anything today except get through it. The route will wait for
        you, and it never keeps score. Hard stretches come in waves, and they pass.
      </p>

      <div className="hardday__actions">
        <a className="door door--primary" href="tel:988">call 988</a>
        <a className="door" href="sms:988">text 988</a>
      </div>
      <p className="hardday__fine">
        988 is the free, 24/7 Suicide &amp; Crisis Lifeline in the United States — you don’t
        have to be in a crisis to call. If you are in immediate danger, call 911.
      </p>

      <div className="hardday__more">
        <button className="margin-link" onClick={onRead}>read: when it gets hard →</button>
        <button className="margin-link" onClick={onSupport}>find someone to talk to →</button>
      </div>
      <p className="hardday__fine">
        If you are feeling much worse than usual, or worried about how you’re doing on your
        medication, contact your prescriber or care team.
      </p>
    </div>
  );
}
