import React from 'react';

/**
 * The Compass mark: a ring, and inside it the Line — ink above, pencil
 * below — with you at the seam. Draws itself in once when `animate` is on.
 */
export default function Logo({ size = 56, animate = false, className = '' }) {
  return (
    <svg
      className={`logo ${animate ? 'logo--draw' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Compass"
    >
      <circle className="logo__ring" cx="32" cy="32" r="22" />
      <line className="logo__ink" x1="32" y1="12" x2="32" y2="32" />
      <line className="logo__pencil" x1="32" y1="32" x2="32" y2="52" />
      <circle className="logo__seam" cx="32" cy="32" r="4.4" />
    </svg>
  );
}
