/**
 * auth.js — accounts and the cloud copy of a route.
 *
 * The URL and publishable key are meant to be public; what protects each
 * person's record is row-level security on the `routes` table (one row per
 * user, readable and writable only by that user).
 */
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL || 'https://nnnxpcnrllhvjmqpbfiv.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3PVoXM7nmHr-3bjstgh6MQ_XMhDF6IQ';

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const here = () => window.location.origin;

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

/** Calls back with (event, session). Returns an unsubscribe function. */
export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(event, session));
  return () => data.subscription.unsubscribe();
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { emailRedirectTo: here() },
  });
  if (error) throw error;
  // No session means the email has to be confirmed first.
  return { needsConfirmation: !data.session };
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: here() });
  if (error) throw error;
}

export async function setNewPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** The saved route for this user, or null if they haven't made one yet. */
export async function loadCloudState(userId) {
  const { data, error } = await supabase
    .from('routes').select('state').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? data.state : null;
}

export async function saveCloudState(userId, state) {
  const { error } = await supabase
    .from('routes')
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function deleteCloudState(userId) {
  const { error } = await supabase.from('routes').delete().eq('user_id', userId);
  if (error) throw error;
}

/** Plain-language errors, never raw codes. */
export function friendly(err) {
  const m = String(err?.message || err || '').toLowerCase();
  if (m.includes('invalid login')) return 'That email and password don’t match.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'There’s already an account with that email. Try signing in.';
  if (m.includes('password') && m.includes('characters')) return 'Use at least 8 characters for the password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many tries just now. Wait a minute and try again.';
  if (m.includes('fetch') || m.includes('network')) return 'Couldn’t reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
