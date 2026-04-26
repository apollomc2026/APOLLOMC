// Apollo shared catalog client — wraps /api/apollo/templates and the
// per-deliverable detail endpoint. Caches in memory: catalog rarely
// changes within a session and template details are stable per slug.

import { apiJson } from './api.js';

let catalogCache = null;
const templateDetailCache = new Map();

// loadCatalog() — returns { catalog: { industries: [...] }, templates: [...] }.
// Backend serves both shapes; we hand them through unchanged so callers
// can pick either the industry-grouped tree (for the dashboard's station
// grid) or the flat list (for legacy lookups).
export async function loadCatalog() {
  if (catalogCache) return catalogCache;
  const data = await apiJson('/api/apollo/templates');
  catalogCache = {
    catalog: data.catalog || { industries: [] },
    templates: data.templates || [],
  };
  return catalogCache;
}

// getDeliverable(slug) — returns the full template payload for a slug:
//   { slug, label, description, industry_slug, industry_label,
//     base_price_cents, estimated_minutes, estimated_pages_min/max,
//     required_fields, optional_fields, file_upload_prompts, sections,
//     available_styles, default_style_id, output_schema }
// Cached per slug.
export async function getDeliverable(slug) {
  if (!slug) return null;
  if (templateDetailCache.has(slug)) return templateDetailCache.get(slug);
  const data = await apiJson('/api/apollo/templates/' + encodeURIComponent(slug));
  if (!data || !data.template) return null;
  templateDetailCache.set(slug, data.template);
  return data.template;
}

// findDeliverable(slug) — synchronous lookup against the loaded catalog.
// Returns the summary (label, industry, price) without fetching detail.
// Use after loadCatalog() has resolved at least once.
export function findDeliverable(slug) {
  if (!catalogCache || !slug) return null;
  const industries = catalogCache.catalog.industries || [];
  for (const ind of industries) {
    const d = (ind.deliverables || []).find((x) => x.slug === slug);
    if (d) {
      // Decorate with industry context so callers don't have to walk back.
      return { ...d, industry_slug: ind.slug, industry_label: ind.label };
    }
  }
  return null;
}

// industryFor(slug) — returns the industry slug that owns this
// deliverable, or null if not found.
export function industryFor(slug) {
  const d = findDeliverable(slug);
  return d ? d.industry_slug : null;
}

// invalidate() — drops both caches. Call after a successful submission
// so "last deployed" timestamps refresh on the next loadCatalog().
export function invalidate() {
  catalogCache = null;
  templateDetailCache.clear();
}
