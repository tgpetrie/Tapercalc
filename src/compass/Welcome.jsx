import React, { useState } from 'react';
import { signUp, signIn, sendReset, setNewPassword, friendly } from './auth.js';

/**
 * Welcome — the front door. No route is shown here; nothing about anyone's
 * taper appears until they've chosen how to come in.
 */

const COPY = {
  signup: { title: 'Create your account', cta: 'create account' },
  signin: { title: 'Welcome back', cta: 'sign in' },
  forgot: { title: 'Reset your password', cta: 'send reset link' },
  reset: { title: 'Choose a new password', cta: 'save password' },
};

export default function Welcome({ initialMode = 'home', onGuest, onSample, notice }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(notice || '');

  const go = (m) => { setMode(m); setError(''); setInfo(''); };

  async function submit(e) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setInfo('Almost there — we sent a link to ' + email.trim() + '. Open it, then come back and sign in.');
          setMode('signin'); setPassword('');
        }
      } else if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else if (mode === 'forgot') {
        await sendReset(email.trim());
        setInfo('If there’s an account for that email, a reset link is on its way.');
      } else if (mode === 'reset') {
        await setNewPassword(password);
        setInfo('Password saved.');
      }
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'home') {
    return (
      <main className="page welcome">
        <p className="welcome__mark">Compass</p>
        <h1 className="welcome__title">A quiet place to keep a taper.</h1>
        <p className="welcome__lede">
          Draw your route, mark each day, and watch the path take shape. The past stays as
          written; the road ahead can always be redrawn from today’s dose.
        </p>

        <div className="welcome__actions">
          <button className="door door--primary" onClick={() => go('signup')}>create an account</button>
          <button className="door" onClick={() => go('signin')}>sign in</button>
          <button className="welcome__guest" onClick={onGuest}>continue as a guest</button>
        </div>

        <p className="welcome__fine">
          An account keeps your route safe and the same on every device. A guest keeps it on
          this device only — clearing the browser clears it.
        </p>
        <p className="welcome__fine">
          Compass is a record and a planning aid, not medical advice. Changes to a taper are
          best made with your prescriber or care team.
        </p>
        {onSample && (
          <button className="welcome__sample" onClick={onSample}>look around with a sample route</button>
        )}
      </main>
    );
  }

  const c = COPY[mode];
  const showEmail = mode !== 'reset';
  const showPassword = mode !== 'forgot';

  return (
    <main className="page welcome">
      {mode !== 'reset' && (
        <button className="back-link" onClick={() => go('home')}>← back</button>
      )}
      <h1 className="welcome__title">{c.title}</h1>

      <form className="welcome__form" onSubmit={submit}>
        {showEmail && (
          <label className="welcome__field">
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </label>
        )}
        {showPassword && (
          <label className="welcome__field">
            <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
            <input type="password" required minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode !== 'signin' && <small>At least 8 characters.</small>}
          </label>
        )}

        {error && <p className="welcome__error" role="alert">{error}</p>}
        {info && <p className="welcome__info" role="status">{info}</p>}

        <button className="door door--primary" type="submit" disabled={busy}>
          {busy ? 'one moment…' : c.cta}
        </button>
      </form>

      <div className="welcome__links">
        {mode === 'signin' && (
          <>
            <button onClick={() => go('forgot')}>forgot your password?</button>
            <button onClick={() => go('signup')}>new here? create an account</button>
          </>
        )}
        {mode === 'signup' && <button onClick={() => go('signin')}>already have an account? sign in</button>}
        {mode === 'forgot' && <button onClick={() => go('signin')}>back to sign in</button>}
        {mode !== 'reset' && <button onClick={onGuest}>or continue as a guest</button>}
      </div>
    </main>
  );
}
