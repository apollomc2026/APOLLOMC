// Apollo shared auth — session probe, redirect URL builder, sign-out,
// and a requireAuth() convenience wrapper that pages register handlers
// against. Pages never call /auth/me directly; they go through this.

import { API, apiCall, apiJson, ApiAuthError, ApiForbiddenError } from './api.js';

// checkAuth() — returns the auth/me payload as
//   { authenticated: bool, authorized: bool, user: { email, name, avatar } | null }
// The endpoint always returns 200 with a body indicating state, so we
// don't translate to typed errors here. (The other API endpoints DO 401
// when unauthenticated, which the typed-error catches in api.js handle.)
export async function checkAuth() {
  try {
    const data = await apiJson('/api/apollo/auth/me');
    if (!data || !data.authenticated) {
      return { authenticated: false, authorized: false, user: null };
    }
    const user = {
      email: data.email,
      name: data.name || null,
      avatar: data.avatar || null,
    };
    return {
      authenticated: true,
      authorized: !!data.authorized,
      user,
    };
  } catch (err) {
    // Network failure or unexpected non-200 — treat as signed-out.
    return { authenticated: false, authorized: false, user: null };
  }
}

// signInUrl(redirectTo) — returns the OAuth redirect URL. Pass the
// current page URL so the OAuth callback returns the user to where they
// were. Defaults to the current location.
export function signInUrl(redirectTo) {
  const target = redirectTo || (typeof window !== 'undefined' ? window.location.href : '');
  if (!target) return API + '/api/apollo/auth/signin';
  return API + '/api/apollo/auth/signin?return_to=' + encodeURIComponent(target);
}

// signOut() — POSTs /auth/signout, then reloads the page so the auth
// modal re-mounts in the signed-out state.
export async function signOut() {
  try {
    await apiCall('/api/apollo/auth/signout', { method: 'POST' });
  } catch {
    // Best effort — even if the call fails, reload to clear local state.
  }
  window.location.reload();
}

// requireAuth({ onSignedOut, onNotAuthorized, onAuthed }) — convenience
// wrapper used by every page on boot. Calls checkAuth() once and dispatches
// to the registered handler. Each handler is optional; missing handlers
// just no-op for that state.
export async function requireAuth(handlers) {
  const h = handlers || {};
  const result = await checkAuth();
  if (!result.authenticated) {
    if (h.onSignedOut) await h.onSignedOut();
    return result;
  }
  if (!result.authorized) {
    if (h.onNotAuthorized) await h.onNotAuthorized(result.user?.email || null);
    return result;
  }
  if (h.onAuthed) await h.onAuthed(result.user);
  return result;
}

// Re-export the typed errors so pages don't have to import from both
// auth.js and api.js — they only import from auth.js for auth flow.
export { ApiAuthError, ApiForbiddenError };
