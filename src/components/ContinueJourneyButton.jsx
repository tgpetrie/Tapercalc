import React from 'react';

export default function ContinueJourneyButton({ onClick, logged = false }) {
  return (
    <button type="button" className="continue-journey-button" onClick={onClick}>
      <span>{logged ? 'Update Check-in' : 'Continue Journey'}</span>
      <small>{logged ? 'Today has been recorded' : 'Log today in under a minute'}</small>
    </button>
  );
}
