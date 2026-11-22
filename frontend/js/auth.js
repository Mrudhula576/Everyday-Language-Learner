// Supabase client and sign-in helpers.
//
// Pages import this lazily (await import('./auth.js')) so the public pages
// still work if the Supabase library can't be downloaded.
//
// PKCE flow: after Google sign-in, Supabase sends people back with
// ?code=... in the query string. The default flow puts tokens in the #hash,
// which our hash router would read as a page name.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { SUPABASE_KEY, SUPABASE_URL } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
});

/** Where Google sends people back to: this app's own address, with no #page. */
function returnUrl() {
  return `${location.origin}${location.pathname}`;
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnUrl() } });
}

let redirectError = null;

/** The Google sign-in error to show once on the Sign up page (then cleared). */
export function takeRedirectError() {
  const error = redirectError;
  redirectError = null;
  return error;
}

/**
 * Finish a Google sign-in and return the page to open next:
 * new learners (no level yet) go to the Level check, others to Home.
 */
export async function finishOAuthRedirect() {
  const params = new URLSearchParams(location.search);
  const failed = params.get('error_description') || params.get('error');

  // getSession() waits for the client to swap ?code= for a session.
  const { data } = await supabase.auth.getSession();
  history.replaceState(null, '', returnUrl());

  if (failed || !data.session) {
    redirectError = failed || 'no session';
    console.warn('Google sign-in failed:', redirectError);
    return '/signup';
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('level')
    .eq('id', data.session.user.id)
    .maybeSingle();
  return profile?.level ? '/home' : '/level-check';
}

/** True if the username isn't used yet (ignores capitals, like the database). */
export async function usernameAvailable(name) {
  const { data, error } = await supabase.rpc('username_available', { name });
  if (error) throw error;
  return data === true;
}
