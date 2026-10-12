import React from 'react';

/**
 * Tiny cartoon weather drawings — plain black line on the page, no colour.
 * Stroke follows the text colour and the fill follows --wx-fill, so a drawing
 * reads as ink on paper and flips cleanly when it sits on a dark chosen chip.
 */

const CLOUD = 'M9 22h13.5a4.6 4.6 0 0 0 .5-9.2A6.6 6.6 0 0 0 10.4 11 5.6 5.6 0 0 0 9 22z';

function Face({ x, y, mood }) {
  return (
    <g className="wx__face">
      {mood === 'sleepy' ? (
        <>
          <path d={`M${x - 3.4} ${y}h2.2M${x + 1.2} ${y}h2.2`} />
          <path d={`M${x - 1.2} ${y + 2.4}q1.2 .8 2.4 0`} />
        </>
      ) : (
        <>
          <circle cx={x - 2.2} cy={y} r="0.75" className="wx__dot" />
          <circle cx={x + 2.2} cy={y} r="0.75" className="wx__dot" />
          {mood === 'happy' && <path d={`M${x - 2} ${y + 2}q2 2 4 0`} />}
          {mood === 'flat' && <path d={`M${x - 1.8} ${y + 2.6}h3.6`} />}
          {mood === 'worried' && <path d={`M${x - 2} ${y + 3.2}q2 -2 4 0`} />}
        </>
      )}
    </g>
  );
}

const DRAW = {
  clear: (
    <>
      <circle cx="16" cy="16" r="6" className="wx__fill" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="16" y1="5.2" x2="16" y2="7.8" transform={`rotate(${a} 16 16)`} />
      ))}
      <Face x={16} y={15.2} mood="happy" />
    </>
  ),
  unsettled: (
    <>
      <circle cx="11.5" cy="11" r="4.6" className="wx__fill" />
      {[-90, -45, 0, 180, 225].map((a) => (
        <line key={a} x1="11.5" y1="3.2" x2="11.5" y2="5" transform={`rotate(${a + 90} 11.5 11)`} />
      ))}
      <path d={CLOUD} transform="translate(2.5 3.5)" className="wx__fill" />
      <Face x={17.6} y={19.4} mood="flat" />
    </>
  ),
  foggy: (
    <>
      <path d={CLOUD} transform="translate(0 -3)" className="wx__fill" />
      <Face x={15.8} y={15.2} mood="sleepy" />
      <path d="M6 24.5h8M17 24.5h9M9 28h10M22 28h3" />
    </>
  ),
  stormy: (
    <>
      <path d={CLOUD} transform="translate(0 -4)" className="wx__fill" />
      <Face x={15.8} y={13.6} mood="worried" />
      <path d="M17 20.2l-3.4 4.6h3l-2 4.2" />
      <path d="M9 21.5l-1 2.2M23 21.5l-1 2.2M9.6 26l-.8 1.8" />
    </>
  ),
};

export default function WeatherIcon({ kind, size = 28, className = '' }) {
  if (!DRAW[kind]) return null;
  return (
    <svg
      className={`wx ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      {DRAW[kind]}
    </svg>
  );
}
