-- ============================================================
-- APOLLO MC — SEED DATA
-- Date: 2026-03-20
-- ============================================================

-- INDUSTRIES
INSERT INTO industries (slug, label, description, sort_order) VALUES
  ('legal',       'Legal',       'Law firms, corporate legal, compliance', 1),
  ('consulting',  'Consulting',  'Management consulting, professional services', 2),
  ('government',  'Government',  'Federal proposals, compliance, capability statements', 3),
  ('finance',     'Finance',     'Financial services, accounting, audit', 4),
  ('startup',     'Startup',     'Entrepreneurs, venture, early-stage companies', 5);

-- DELIVERABLE TYPES (Legal)
INSERT INTO deliverable_types
  (industry_id, slug, label, estimated_pages_min, estimated_pages_max,
   estimated_minutes, base_price_cents, schema_file)
SELECT id, slug, label, mn, mx, mins, price, schema FROM industries
JOIN (VALUES
  ('legal', 'legal-memo',           'Legal Memorandum',         4,  8,  8,  6500, 'legal-memo.schema.json'),
  ('legal', 'contract-package',     'Contract Package',         8, 20, 14,  9500, 'contract-package.schema.json'),
  ('legal', 'discovery-summary',    'Discovery Summary',        6, 15, 10,  7500, 'discovery-summary.schema.json'),
  ('legal', 'compliance-report',    'Compliance Report',        8, 20, 12,  8500, 'compliance-report.schema.json')
) AS v(industry_slug, slug, label, mn, mx, mins, price, schema)
ON industries.slug = v.industry_slug;

-- DELIVERABLE TYPES (Consulting)
INSERT INTO deliverable_types
  (industry_id, slug, label, estimated_pages_min, estimated_pages_max,
   estimated_minutes, base_price_cents, schema_file)
SELECT id, slug, label, mn, mx, mins, price, schema FROM industries
JOIN (VALUES
  ('consulting', 'exec-presentation',    'Executive Presentation',  12, 25, 12,  9500, 'exec-presentation.schema.json'),
  ('consulting', 'business-plan',        'Business Plan',           20, 40, 20, 14500, 'business-plan.schema.json'),
  ('consulting', 'sow',                  'Statement of Work',        6, 12,  8,  6500, 'sow.schema.json'),
  ('consulting', 'market-analysis',      'Market Analysis',         10, 20, 14,  8500, 'market-analysis.schema.json')
) AS v(industry_slug, slug, label, mn, mx, mins, price, schema)
ON industries.slug = v.industry_slug;

-- DELIVERABLE TYPES (Government)
INSERT INTO deliverable_types
  (industry_id, slug, label, estimated_pages_min, estimated_pages_max,
   estimated_minutes, base_price_cents, schema_file)
SELECT id, slug, label, mn, mx, mins, price, schema FROM industries
JOIN (VALUES
  ('government', 'federal-proposal',     'Federal Proposal Response', 20, 50, 30, 19500, 'federal-proposal.schema.json'),
  ('government', 'capability-statement', 'Capability Statement',       2,  4,  5,  4500, 'capability-statement.schema.json'),
  ('government', 'pwp',                  'Past Performance Write-Up',  4,  8,  8,  6500, 'pwp.schema.json')
) AS v(industry_slug, slug, label, mn, mx, mins, price, schema)
ON industries.slug = v.industry_slug;

-- DELIVERABLE TYPES (Finance)
INSERT INTO deliverable_types
  (industry_id, slug, label, estimated_pages_min, estimated_pages_max,
   estimated_minutes, base_price_cents, schema_file)
SELECT id, slug, label, mn, mx, mins, price, schema FROM industries
JOIN (VALUES
  ('finance', 'board-report',         'Board Report',              8, 20, 12,  8500, 'board-report.schema.json'),
  ('finance', 'investor-memo',        'Investor Memo',             6, 15, 10,  7500, 'investor-memo.schema.json'),
  ('finance', 'audit-readiness',      'Audit Readiness Report',   10, 25, 16,  9500, 'audit-readiness.schema.json')
) AS v(industry_slug, slug, label, mn, mx, mins, price, schema)
ON industries.slug = v.industry_slug;

-- DELIVERABLE TYPES (Startup)
INSERT INTO deliverable_types
  (industry_id, slug, label, estimated_pages_min, estimated_pages_max,
   estimated_minutes, base_price_cents, schema_file)
SELECT id, slug, label, mn, mx, mins, price, schema FROM industries
JOIN (VALUES
  ('startup', 'pitch-deck',       'Pitch Deck',          12, 20,  9,  7500, 'pitch-deck.schema.json'),
  ('startup', 'one-pager',        'One-Pager',            1,  2,  4,  4500, 'one-pager.schema.json'),
  ('startup', 'investor-update',  'Investor Update',      4,  8,  6,  5500, 'investor-update.schema.json')
) AS v(industry_slug, slug, label, mn, mx, mins, price, schema)
ON industries.slug = v.industry_slug;
