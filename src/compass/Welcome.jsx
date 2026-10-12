import Logo from './Logo.jsx';
import React, { useState } from 'react';
import { signUp, signIn, sendReset, setNewPassword, friendly } from './auth.js';

/**
 * Welcome — the front door. No route is shown here; nothing about anyone's
 * taper appears until they've chosen how to come in.
 */

const COPY = {
  signup: { title: 'Create your account', cta: 'Create account' },
  signin: { title: 'Welcome back', cta: 'Sign in' },
  forgot: { title: 'Reset your password', cta: 'Send reset link' },
  reset: { title: 'Choose a new password', cta: 'Save password' },
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
        <header className="welcome__brand">
          <Logo size={40} animate />
          <span className="welcome__mark">Compass</span>
        </header>

        <section className="welcome__intro">
          <h1 className="welcome__title">A quiet place to keep a taper.</h1>
          <p className="welcome__lede">
            Mark each day, watch the path take shape, and redraw the road ahead whenever you
            need to. The past always stays as written.
          </p>
        </section>

        <div className="welcome__actions">
          <button className="door door--primary" onClick={() => go('signup')}>Create an account</button>
          <button className="door" onClick={() => go('signin')}>Sign in</button>
          <button className="welcome__guest" onClick={onGuest}>Continue as a guest</button>
        </div>

        <footer className="welcome__fine">
          <p>
            An account keeps your route safe and the same on every device. As a guest, your
            route stays on this device only.
          </p>
          <p>
            Compass is a record and a planning aid, not medical advice. Decide changes to a
            taper with your prescriber or care team.
          </p>
          {onSample && (
            <button className="welcome__sample" onClick={onSample}>Look around with a sample route</button>
          )}
        </footer>
      </main>
    );
  }

  const c = COPY[mode];
  const showEmail = mode !== 'reset';
  const showPassword = mode !== 'forgot';

  return (
    <main className="page welcome welcome--sub">
      {mode !== 'reset' && (
        <button className="back-link" onClick={() => go('home')}>← Back</button>
      )}
      <section className="welcome__intro">
        <h1 className="welcome__title">{c.title}</h1>
      </section>

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
          {busy ? 'One moment…' : c.cta}
        </button>
      </form>

      <div className="welcome__links">
        {mode === 'signin' && (
          <>
            <button onClick={() => go('forgot')}>Forgot your password?</button>
            <button onClick={() => go('signup')}>New here? Create an account</button>
          </>
        )}
        {mode === 'signup' && <button onClick={() => go('signin')}>Already have an account? Sign in</button>}
        {mode === 'forgot' && <button onClick={() => go('signin')}>Back to sign in</button>}
        {mode !== 'reset' && <button onClick={onGuest}>Or continue as a guest</button>}
      </div>
    </main>
  );
}
