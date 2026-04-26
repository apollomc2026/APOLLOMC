// Apollo shared API client — fetch wrappers + typed errors.
//
// Every module that talks to the backend goes through here so:
//   - The base URL lives in one place.
//   - Auth state is surfaced as typed exceptions instead of silent
//     state mutations (this is the diagnostic that would have made
//     yesterday's 500 debugging trivial).
//   - Cookie credentials are always sent.

export const API = 'https://portal.apollomc.ai';

// Typed errors. Pages catch by class:
//   try { ... } catch (e) {
//     if (e instanceof ApiAuthError) return redirectToSignIn();
//     if (e instanceof ApiForbiddenError) return showNotAuthorized();
//     if (e instanceof ApiHttpError) return toast(e.message);
//   }
export class ApiAuthError extends Error {
  constructor(message) {
    super(message || 'Not authenticated');
    this.name = 'ApiAuthError';
    this.status = 401;
  }
}

export class ApiForbiddenError extends Error {
  constructor(message) {
    super(message || 'Not authorized');
    this.name = 'ApiForbiddenError';
    this.status = 403;
  }
}

export class ApiHttpError extends Error {
  constructor(status, body) {
    const msg =
      (body && typeof body === 'object' && body.error) ||
      (typeof body === 'string' && body) ||
      ('HTTP ' + status);
    super(msg);
    this.name = 'ApiHttpError';
    this.status = status;
    this.body = body;
  }
}

// apiCall(path, init) — raw fetch wrapper. Always sets credentials and
// keeps caller-provided headers. Returns the Response untouched. Use this
// when you need full control over the response (file downloads, streams).
export async function apiCall(path, init = {}) {
  return fetch(API + path, {
    credentials: 'include',
    ...init,
    headers: { ...(init.headers || {}) },
  });
}

// apiJson(path, init) — JSON-shaped wrapper. Throws typed errors on auth
// state and HTTP failures; returns the parsed JSON body on success.
//   init.body, when an object/array, is auto-stringified and the
//   content-type header is set.
export async function apiJson(path, init = {}) {
  const headers = { 'Accept': 'application/json', ...(init.headers || {}) };
  let body = init.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
    if (!headers['content-type'] && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }
  const res = await fetch(API + path, {
    credentials: 'include',
    ...init,
    body,
    headers,
  });
  if (res.status === 401) throw new ApiAuthError();
  if (res.status === 403) {
    let parsed = null;
    try { parsed = await res.json(); } catch {}
    throw new ApiForbiddenError(parsed && parsed.error);
  }
  let parsed = null;
  try { parsed = await res.json(); } catch {}
  if (!res.ok) throw new ApiHttpError(res.status, parsed);
  return parsed;
}
