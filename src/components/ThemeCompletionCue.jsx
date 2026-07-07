import React from 'react';

export default function ThemeCompletionCue({ theme, visible }) {
  if (!visible) return null;
  return (
    <div className={`completion-cue cue-${theme}`} aria-live="polite">
      <span className="cue-path" />
      <strong>Check-in saved.</strong>
    </div>
  );
}
