// Apollo shared submissions client — list + per-id detail.
//
// Normalizes the download URL so consumers see one consistent field:
// older rows use drive_file_url, newer use download_url. We map both to
// the same field and also expose pdf_url for backward-compat with code
// that already reads pdf_url.

import { apiJson } from './api.js';

function normalizeOne(s) {
  const dl = s && (s.download_url || s.drive_file_url || null);
  return {
    ...s,
    download_url: dl,
    pdf_url: dl,
  };
}

// list({ limit, brand, since }) — recent submissions, most-recent-first.
// Returns { submissions: [...], total_count }.
export async function list(opts) {
  const o = opts || {};
  const params = new URLSearchParams();
  if (typeof o.limit === 'number') params.set('limit', String(o.limit));
  if (o.brand) params.set('brand', o.brand);
  if (o.since) params.set('since', o.since);
  const qs = params.toString();
  const data = await apiJson('/api/apollo/submissions' + (qs ? '?' + qs : ''));
  const submissions = Array.isArray(data && data.submissions) ? data.submissions : [];
  return {
    submissions: submissions.map(normalizeOne),
    total_count: (data && data.total_count) || submissions.length,
  };
}

// get(id) — full submission detail. Same normalization rule.
export async function get(id) {
  if (!id) return null;
  const data = await apiJson('/api/apollo/submissions/' + encodeURIComponent(id));
  if (!data) return null;
  // Endpoint may return { submission: {...} } or the row inline.
  const row = data.submission || data;
  return normalizeOne(row);
}
