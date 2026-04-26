// Apollo wizard drafts — localStorage-backed, 7-day TTL, scoped by
// (slug, brand) so a user's NDA-for-Apollo draft doesn't collide with
// their NDA-for-Atlas draft.
//
// Pages call save() debounced on every wizard mutation, load() once at
// boot, and purgeOld() once on bootstrap to clear stale entries.

const DRAFT_PREFIX = 'apollo:draft:';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function key(slug, brand) {
  return DRAFT_PREFIX + slug + ':' + (brand || 'default');
}

// save(slug, brand, payload) — persists the draft. payload should be a
// plain object; we wrap it with updated_at so load() can TTL-check.
export function save(slug, brand, payload) {
  if (!slug) return;
  try {
    localStorage.setItem(
      key(slug, brand),
      JSON.stringify({ ...payload, updated_at: Date.now() })
    );
  } catch {
    // Storage full / private mode — silently ignore. Drafts are
    // best-effort, not load-bearing.
  }
}

// load(slug, brand) — returns the payload or null. Auto-purges if older
// than TTL.
export function load(slug, brand) {
  if (!slug) return null;
  try {
    const raw = localStorage.getItem(key(slug, brand));
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return null;
    if (Date.now() - (draft.updated_at || 0) > DRAFT_TTL_MS) {
      localStorage.removeItem(key(slug, brand));
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

// clear(slug, brand) — removes a single draft.
export function clear(slug, brand) {
  if (!slug) return;
  try { localStorage.removeItem(key(slug, brand)); } catch {}
}

// purgeOld() — sweeps localStorage and removes any draft past the TTL.
// Called on every page boot.
export function purgeOld() {
  try {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(DRAFT_PREFIX)) continue;
      try {
        const d = JSON.parse(localStorage.getItem(k) || 'null');
        if (!d || Date.now() - (d.updated_at || 0) > DRAFT_TTL_MS) stale.push(k);
      } catch {
        stale.push(k);
      }
    }
    for (const k of stale) {
      try { localStorage.removeItem(k); } catch {}
    }
  } catch {}
}

// list() — returns array of { slug, brand, updated_at, snippet } for any
// non-stale drafts. Reserved for a future "resume your drafts" UI; not
// used in v1, but the API is here so callers can build it without
// re-implementing the parsing.
export function list() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(DRAFT_PREFIX)) continue;
      let d = null;
      try { d = JSON.parse(localStorage.getItem(k) || 'null'); } catch {}
      if (!d || typeof d !== 'object') continue;
      if (Date.now() - (d.updated_at || 0) > DRAFT_TTL_MS) continue;
      const rest = k.slice(DRAFT_PREFIX.length);
      const colon = rest.lastIndexOf(':');
      const slug = colon >= 0 ? rest.slice(0, colon) : rest;
      const brand = colon >= 0 ? rest.slice(colon + 1) : 'default';
      out.push({
        slug,
        brand,
        updated_at: d.updated_at || 0,
        snippet: snippetOf(d),
      });
    }
  } catch {}
  out.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
  return out;
}

function snippetOf(d) {
  if (!d || !d.fields) return '';
  const firstVal = Object.values(d.fields).find((v) => typeof v === 'string' && v.trim());
  return typeof firstVal === 'string' ? firstVal.slice(0, 80) : '';
}
