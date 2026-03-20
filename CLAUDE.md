# APOLLO MC — CLAUDE CODE BUILD PLAN
**Version:** 1.0 | **Date:** March 20, 2026 | **Owner:** Jon Sargent, On Spot Solutions LLC

---

## EXECUTION DIRECTIVE

Read this file completely before touching anything. Execute every phase in sequence. Do not skip phases. Do not ask questions mid-execution. Do not stop until the final acceptance test passes. If a step fails, retry once with a corrected approach, log the failure, and continue. The only valid reason to halt is an unrecoverable infrastructure error. Everything else is solvable. Deliver finished work.

---

## SYSTEM INVARIANTS — NEVER BREAK THESE

1. **Industry → Deliverable → Style** selection cascade must complete before any intake question fires
2. **Execution never starts** until the Mission Brief is approved by the customer
3. **Every unit of work is a task** with a status, retry count, and checkpoint — no monolithic generation
4. **Schema validation is mandatory** — if output fails schema, attempt repair, then failover provider
5. **The real file never leaves S3** until Stripe payment webhook confirms success
6. **Every delivered file** receives a steganographic buyer ID watermark before download URL is generated
7. **Checkpoints write to S3 staging** after every completed section — failure resumes, never restarts
8. **Apollo infrastructure is completely air-gapped from ATLAS** — separate AWS, separate Supabase, separate GitHub org

---

## INFRASTRUCTURE MAP — WHAT EXISTS

```
apollomc.ai          → GoDaddy (DNS migration to Hostinger pending)
Hostinger            → On Spot parent account — apollomc.ai site added here
Supabase             → support@apollomc.ai — project exists, ZERO tables deployed
AWS                  → support@apollomc.ai — account created, IAM pending
GitHub               → org: apollomc — to be created
Python intake form   → waitlist handler (Node.js Lambda replacing Zapier)
```

**Stack locked — do not revisit:**
- Marketing site: Static HTML on Hostinger
- Auth + Database: Supabase (Apollo account)
- Email: AWS SES (Apollo AWS account)
- File storage: AWS S3 private bucket (Apollo AWS account)
- Portal: Next.js on Vercel
- AI engine: Anthropic Claude API (Apollo key)
- Payments: Stripe (pay-per-deliverable)
- CI/CD: GitHub org `apollomc`
- Style runner: Python microservice (`apollo-processor`)

---

## REPOSITORY STRUCTURE

```
apollomc/
├── CLAUDE.md                          ← this file
├── apps/
│   ├── portal/                        ← Next.js customer portal
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (protected)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── new-mission/
│   │   │   │   │   ├── industry/      ← Gate 1
│   │   │   │   │   ├── deliverable/   ← Gate 2
│   │   │   │   │   ├── style/         ← Gate 3
│   │   │   │   │   ├── intake/        ← Launch Pad
│   │   │   │   │   └── brief/         ← Mission brief approval
│   │   │   │   ├── mission/[id]/      ← Live job board
│   │   │   │   ├── review/[id]/       ← Review window
│   │   │   │   └── files/             ← Customer file system
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── missions/
│   │   │       ├── intake/
│   │   │       ├── jobs/
│   │   │       ├── stripe/
│   │   │       └── delivery/
│   │   ├── components/
│   │   │   ├── cascade/               ← Industry/deliverable selectors
│   │   │   ├── launch-pad/            ← Guided intake wizard
│   │   │   ├── job-board/             ← Live build status
│   │   │   ├── review/                ← Preview + edit surface
│   │   │   └── ui/                    ← Shared components
│   │   └── lib/
│   │       ├── supabase/
│   │       ├── stripe/
│   │       ├── s3/
│   │       └── types/
│   └── processor/                     ← Python microservice (Lambda)
│       ├── extractor/                 ← PDF/DOCX/XLSX → JSON
│       │   ├── pdf.py
│       │   ├── docx.py
│       │   ├── xlsx.py
│       │   └── brand.py               ← Brand guide extraction
│       ├── assembler/                 ← Plan builder
│       │   ├── plan_builder.py        ← PLAN.md generator
│       │   └── brief_builder.py       ← Mission brief generator
│       ├── watermark/
│       │   └── steg.py                ← Steganographic buyer ID
│       ├── preview/
│       │   └── render.py              ← Degraded preview generator
│       └── handler.py                 ← Lambda entry point
├── packages/
│   ├── style-library/                 ← CLAUDE.md style files
│   │   ├── legal/
│   │   │   ├── legal-classic.md
│   │   │   ├── legal-modern.md
│   │   │   └── legal-minimal.md
│   │   ├── consulting/
│   │   │   ├── consulting-executive.md
│   │   │   ├── consulting-strategy.md
│   │   │   └── consulting-bold.md
│   │   ├── government/
│   │   │   ├── gov-federal-standard.md
│   │   │   ├── gov-proposal.md
│   │   │   └── gov-compliance.md
│   │   ├── finance/
│   │   │   ├── finance-board.md
│   │   │   ├── finance-investor.md
│   │   │   └── finance-audit.md
│   │   └── startup/
│   │       ├── startup-pitch.md
│   │       ├── startup-bold.md
│   │       └── startup-minimal.md
│   ├── catalog/                       ← Industry/deliverable definitions
│   │   └── catalog.json
│   └── schemas/                       ← Task output schemas per deliverable
│       ├── legal-memo.schema.json
│       ├── contract-package.schema.json
│       ├── exec-presentation.schema.json
│       └── ...
├── infrastructure/
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_baseline.sql       ← Full schema migration
│   ├── aws/
│   │   ├── s3-policy.json
│   │   ├── ses-identity.json
│   │   └── lambda-role.json
│   └── vercel/
│       └── vercel.json
└── docs/
    └── runbooks/
```

---

## PHASE 0 — REPOSITORY + ENVIRONMENT BOOTSTRAP

**Goal:** Clean repo scaffold, environment configs, CI pipeline skeleton.

### 0.1 Initialize Repository

```bash
# Run from apollomc org root
git init apollomc
cd apollomc
npx create-turbo@latest . --no-install
npm install
```

Create root `.env.example`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_PRIVATE=apollo-outputs-private
S3_BUCKET_PREVIEWS=apollo-previews-public
SES_FROM_ADDRESS=missions@apollomc.ai

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://app.apollomc.ai
```

Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```

**Acceptance:** `git push origin main` triggers CI green.

---

## PHASE 1 — SUPABASE SCHEMA

**Goal:** Deploy complete database schema with RLS. Zero tables exist — this is a clean migration.

### 1.1 Write Migration File

Create `infrastructure/supabase/migrations/001_baseline.sql`:

```sql
-- ============================================================
-- APOLLO MC — BASELINE SCHEMA
-- Migration: 001_baseline
-- Date: 2026-03-20
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CATALOG TABLES (seeded, not user-generated)
-- ============================================================

CREATE TABLE industries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          VARCHAR(50) UNIQUE NOT NULL,
  label         VARCHAR(100) NOT NULL,
  description   TEXT,
  icon_key      VARCHAR(50),
  sort_order    INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deliverable_types (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id         UUID NOT NULL REFERENCES industries(id),
  slug                VARCHAR(100) UNIQUE NOT NULL,
  label               VARCHAR(150) NOT NULL,
  description         TEXT,
  estimated_pages_min INTEGER,
  estimated_pages_max INTEGER,
  estimated_minutes   INTEGER,
  base_price_cents    INTEGER NOT NULL,
  schema_file         VARCHAR(255),       -- path to JSON schema in repo
  sort_order          INTEGER DEFAULT 0,
  active              BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE style_templates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_type_id UUID NOT NULL REFERENCES deliverable_types(id),
  slug                VARCHAR(100) UNIQUE NOT NULL,
  label               VARCHAR(150) NOT NULL,
  description         TEXT,
  claude_md_path      VARCHAR(255) NOT NULL,  -- path in style-library/
  preview_s3_key      VARCHAR(500),           -- rendered preview image
  version             INTEGER DEFAULT 1,
  active              BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER TABLES
-- ============================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255),
  company_name    VARCHAR(255),
  tier            VARCHAR(50) DEFAULT 'free',
    -- free | gemini | apollo | saturn_v
  stripe_customer_id VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MISSION TABLES
-- ============================================================

CREATE TABLE missions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  industry_id           UUID NOT NULL REFERENCES industries(id),
  deliverable_type_id   UUID NOT NULL REFERENCES deliverable_types(id),
  style_template_id     UUID NOT NULL REFERENCES style_templates(id),
  style_template_version INTEGER NOT NULL,  -- locked at mission creation

  status  VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- draft | intake | brief_pending | brief_approved
    -- | queued | building | review | awaiting_payment
    -- | paid | delivered | archived | failed

  mission_brief         JSONB,    -- assembled brief shown to customer
  project_spec          JSONB,    -- locked spec after brief approval
  plan_md_s3_key        VARCHAR(500),  -- PLAN.md in S3
  claude_md_s3_key      VARCHAR(500),  -- assembled CLAUDE.md in S3

  -- Pricing
  quoted_price_cents    INTEGER,
  paid_price_cents      INTEGER,
  stripe_payment_intent VARCHAR(255),
  stripe_charge_id      VARCHAR(255),
  paid_at               TIMESTAMPTZ,

  -- Timing
  brief_approved_at     TIMESTAMPTZ,
  queued_at             TIMESTAMPTZ,
  build_started_at      TIMESTAMPTZ,
  build_completed_at    TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,

  -- Retention
  expires_at            TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTAKE TABLES
-- ============================================================

CREATE TABLE intake_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  messages    JSONB DEFAULT '[]',   -- full conversation history
  collected   JSONB DEFAULT '{}',   -- field key → value map
  complete    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE uploaded_files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  kind            VARCHAR(50) NOT NULL,
    -- reference_doc | reference_image | brand_guide | financial_data
  original_name   VARCHAR(500) NOT NULL,
  s3_key          VARCHAR(500) NOT NULL,
  mime_type       VARCHAR(100),
  file_size_bytes BIGINT,
  extracted_json  JSONB,     -- populated by apollo-processor extraction pass
  extraction_status VARCHAR(50) DEFAULT 'pending',
    -- pending | processing | complete | failed
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASK TABLES (execution engine)
-- ============================================================

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  task_type       VARCHAR(100) NOT NULL,
  section_key     VARCHAR(100),   -- e.g. "executive_summary", "financials"
  section_index   INTEGER,        -- order within document
  status          VARCHAR(50) NOT NULL DEFAULT 'queued',
    -- queued | running | complete | failed | skipped
  depends_on      UUID[],         -- task IDs that must complete first
  provider        VARCHAR(50),    -- claude-sonnet-4 | gpt-4o
  prompt_s3_key   VARCHAR(500),
  output_raw      TEXT,
  output_json     JSONB,
  schema_valid    BOOLEAN,
  repair_attempts INTEGER DEFAULT 0,
  attempt_count   INTEGER DEFAULT 0,
  max_attempts    INTEGER DEFAULT 3,
  checkpoint_s3_key VARCHAR(500), -- staged output before final compile
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OUTPUT TABLES
-- ============================================================

CREATE TABLE outputs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id            UUID NOT NULL REFERENCES missions(id),
  version               INTEGER DEFAULT 1,
  format                VARCHAR(20) NOT NULL,  -- pdf | docx | pptx | zip
  s3_key_private        VARCHAR(500) NOT NULL,  -- production file, private
  s3_key_preview        VARCHAR(500),           -- degraded preview
  watermark_buyer_id    UUID,     -- embedded in file, traceable
  file_size_bytes       BIGINT,
  page_count            INTEGER,
  status                VARCHAR(50) DEFAULT 'staged',
    -- staged | preview_ready | paid | delivered | superseded
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  output_id     UUID NOT NULL REFERENCES outputs(id),
  mission_id    UUID NOT NULL REFERENCES missions(id),
  token         VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT TABLES
-- ============================================================

CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id  UUID REFERENCES missions(id),
  user_id     UUID REFERENCES profiles(id),
  event_type  VARCHAR(100) NOT NULL,
  event_data  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prompt_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id         UUID NOT NULL REFERENCES tasks(id),
  provider        VARCHAR(50) NOT NULL,
  model           VARCHAR(100) NOT NULL,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  cost_usd_micro  INTEGER,  -- cost in millionths of a dollar
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_tasks_mission_id ON tasks(mission_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_uploaded_files_mission_id ON uploaded_files(mission_id);
CREATE INDEX idx_outputs_mission_id ON outputs(mission_id);
CREATE INDEX idx_events_mission_id ON events(mission_id);
CREATE INDEX idx_delivery_tokens_token ON delivery_tokens(token);
CREATE INDEX idx_delivery_tokens_expires ON delivery_tokens(expires_at);
CREATE INDEX idx_deliverable_types_industry ON deliverable_types(industry_id);
CREATE INDEX idx_style_templates_deliverable ON style_templates(deliverable_type_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Missions: users see only their own
CREATE POLICY "missions_own" ON missions
  FOR ALL USING (auth.uid() = user_id);

-- Intake sessions: via mission ownership
CREATE POLICY "intake_own" ON intake_sessions
  FOR ALL USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Uploaded files: via mission ownership
CREATE POLICY "files_own" ON uploaded_files
  FOR ALL USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Tasks: read-only via mission ownership
CREATE POLICY "tasks_read_own" ON tasks
  FOR SELECT USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Outputs: via mission ownership
CREATE POLICY "outputs_own" ON outputs
  FOR SELECT USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Catalog tables: public read
CREATE POLICY "industries_public_read" ON industries FOR SELECT USING (true);
CREATE POLICY "deliverable_types_public_read" ON deliverable_types FOR SELECT USING (true);
CREATE POLICY "style_templates_public_read" ON style_templates FOR SELECT USING (true);

-- Enable RLS on catalog
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_missions_updated_at
  BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_intake_updated_at
  BEFORE UPDATE ON intake_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 1.2 Apply Migration

```bash
npx supabase db push --project-ref [APOLLO_PROJECT_REF]
```

### 1.3 Seed Catalog Data

Create `infrastructure/supabase/seed.sql` and apply:

```sql
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
```

**Acceptance:** Query `SELECT count(*) FROM deliverable_types` returns 17+. All foreign keys resolve.

---

## PHASE 2 — AWS INFRASTRUCTURE

**Goal:** S3 buckets, SES domain verification, IAM user, Lambda role.

### 2.1 S3 Buckets

Create two buckets in `us-east-1`:

**Private bucket** (`apollo-outputs-private`):
```json
{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": true,
  "RestrictPublicBuckets": true,
  "VersioningEnabled": true,
  "LifecycleRules": [
    {
      "id": "expire-previews",
      "prefix": "previews/",
      "expiration_days": 7
    },
    {
      "id": "expire-staging",
      "prefix": "staging/",
      "expiration_days": 3
    }
  ]
}
```

**Folder structure within private bucket:**
```
apollo-outputs-private/
├── outputs/{mission_id}/{version}/       ← watermarked production files
├── staging/{mission_id}/{task_id}/       ← checkpoints during build
├── plans/{mission_id}/                   ← PLAN.md and CLAUDE.md per mission
├── uploads/{mission_id}/                 ← customer uploaded files
└── previews/{mission_id}/                ← degraded preview JPEGs
```

### 2.2 IAM User

Create `apollo-app-user` with policy scoped to Apollo buckets only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:GeneratePresignedUrl"],
      "Resource": "arn:aws:s3:::apollo-outputs-private/*"
    },
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail","ses:SendRawEmail"],
      "Resource": "*",
      "Condition": {
        "StringEquals": { "ses:FromAddress": "missions@apollomc.ai" }
      }
    }
  ]
}
```

Store generated `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in:
- Vercel environment variables (portal)
- GitHub Actions secrets (CI)
- Local `.env.local` (never commit)

### 2.3 SES Domain Verification

```bash
aws ses verify-domain-identity --domain apollomc.ai
aws ses verify-domain-dkim --domain apollomc.ai
# Add returned CNAME records to Hostinger DNS panel
```

**Acceptance:** `aws ses get-identity-verification-attributes --identities apollomc.ai` returns `"VerificationStatus": "Success"`.

---

## PHASE 3 — PYTHON PROCESSOR SERVICE

**Goal:** Lambda that handles file extraction, plan assembly, and watermarking.

### 3.1 Setup

```bash
cd apps/processor
python -m venv venv && source venv/bin/activate
pip install pdfplumber python-docx openpyxl pandas boto3 pillow \
            anthropic stegano reportlab Pillow
```

### 3.2 Extraction Layer

Create `apps/processor/extractor/pdf.py`:
```python
import pdfplumber
import json

def extract_pdf(file_bytes: bytes) -> dict:
    """
    Extract structured content from PDF.
    Returns: { text: str, tables: list, pages: int, metadata: dict }
    """
    result = {"text": "", "tables": [], "pages": 0, "metadata": {}}
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        result["pages"] = len(pdf.pages)
        result["metadata"] = pdf.metadata or {}
        full_text = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
            tables = page.extract_tables()
            for table in tables:
                result["tables"].append({
                    "page": page.page_number,
                    "data": table
                })
        result["text"] = "\n\n".join(full_text)
    return result
```

Create `apps/processor/extractor/brand.py`:
```python
def extract_brand_rules(extracted_content: dict) -> dict:
    """
    Parse brand guide content into structured rules.
    Uses Claude API to identify:
    - Primary/secondary colors (hex)
    - Font families (heading, body)
    - Tone keywords
    - Logo usage rules
    Returns: brand_rules dict injected into mission CLAUDE.md
    """
    import anthropic
    client = anthropic.Anthropic()
    
    prompt = f"""
    Analyze this brand guide content and extract structured brand rules.
    Return ONLY valid JSON with this exact schema:
    {{
      "primary_color": "#hex",
      "secondary_colors": ["#hex"],
      "heading_font": "font name",
      "body_font": "font name",
      "tone_keywords": ["word1", "word2"],
      "logo_usage_rules": ["rule1", "rule2"],
      "formatting_notes": "any specific formatting requirements"
    }}
    
    Content:
    {extracted_content['text'][:8000]}
    """
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    import json
    return json.loads(response.content[0].text)
```

### 3.3 Plan Assembler

Create `apps/processor/assembler/plan_builder.py`:
```python
def build_plan_md(
    mission: dict,
    deliverable_type: dict,
    style_template_content: str,
    intake_data: dict,
    extracted_files: list,
    brand_rules: dict | None
) -> str:
    """
    Assembles the PLAN.md that Claude Code executes.
    This is the source of truth for the build mission.
    """
    
    sections = deliverable_type.get("sections", [])
    
    plan = f"""# APOLLO BUILD MISSION
**Mission ID:** {mission['id']}
**Deliverable:** {deliverable_type['label']}
**Customer:** {mission.get('company_name', 'Not specified')}
**Date:** {datetime.utcnow().strftime('%Y-%m-%d')}

---

## EXECUTION DIRECTIVE
Read every section of this plan before writing anything.
Execute sections in the order listed.
Write each completed section to: staging/{mission['id']}/[section_key].json
Do not stop until all sections are complete and compiled.
Kickoff command: read CLAUDE.md and PLAN.md then execute full build start to finish.

---

## STYLE RULES
{style_template_content}

"""

    if brand_rules:
        plan += f"""
## BRAND RULES (from uploaded brand guide)
- Primary color: {brand_rules.get('primary_color', 'not specified')}
- Secondary colors: {', '.join(brand_rules.get('secondary_colors', []))}
- Heading font: {brand_rules.get('heading_font', 'not specified')}
- Body font: {brand_rules.get('body_font', 'not specified')}
- Tone: {', '.join(brand_rules.get('tone_keywords', []))}
- Formatting notes: {brand_rules.get('formatting_notes', 'none')}

"""

    plan += f"""
## CUSTOMER INPUTS
"""
    for key, value in intake_data.items():
        plan += f"- **{key}:** {value}\n"

    if extracted_files:
        plan += "\n## REFERENCE DOCUMENTS\n"
        for f in extracted_files:
            plan += f"\n### {f['original_name']}\n"
            plan += f"Extracted text:\n{f['extracted_json']['text'][:4000]}\n"
            if f['extracted_json'].get('tables'):
                plan += f"Tables detected: {len(f['extracted_json']['tables'])}\n"

    plan += "\n## SECTIONS TO BUILD\n"
    plan += "Build each section completely before moving to the next.\n"
    plan += "After completing each section, write output to staging.\n\n"
    
    for i, section in enumerate(sections, 1):
        plan += f"""
### Section {i}: {section['label']} [{section['key']}]
**Required:** {section.get('required', True)}
**Estimated length:** {section.get('min_words', 100)}–{section.get('max_words', 500)} words
**Instructions:** {section.get('instructions', 'Write professionally and completely.')}
**Checkpoint:** Write completed section to staging/{mission['id']}/{section['key']}.json before continuing.

"""

    plan += """
## COMPILE
After all sections are complete:
1. Assemble sections in order into final document
2. Apply style rules throughout
3. Verify page count matches estimate
4. Write final output to outputs/{mission_id}/v1/
5. Signal completion by writing outputs/{mission_id}/v1/COMPLETE

## QUALITY GATE
The quality gate will run automatically after COMPLETE signal.
If it fails, you will receive a retry instruction with specific feedback.
"""
    
    return plan
```

### 3.4 Watermark Service

Create `apps/processor/watermark/steg.py`:
```python
from PIL import Image
import struct
import io

def embed_buyer_id(pdf_bytes: bytes, buyer_id: str, mission_id: str) -> bytes:
    """
    Embeds buyer_id and mission_id invisibly in PDF output.
    Uses LSB steganography on the first rendered page image.
    The payload survives JPEG compression at quality >= 85.
    """
    payload = f"APOLLO:{buyer_id}:{mission_id}".encode('utf-8')
    # Implementation: render first PDF page to image,
    # embed payload in LSBs of pixel data,
    # recomposite into PDF
    # Full implementation uses reportlab + pillow
    return _embed_in_pdf(pdf_bytes, payload)

def extract_buyer_id(pdf_bytes: bytes) -> dict | None:
    """
    Extracts buyer identification from a delivered file.
    Used for enforcement if file appears publicly without authorization.
    Returns: { buyer_id, mission_id } or None if not found
    """
    payload = _extract_from_pdf(pdf_bytes)
    if not payload or not payload.startswith(b"APOLLO:"):
        return None
    parts = payload.decode('utf-8').split(':')
    return {"buyer_id": parts[1], "mission_id": parts[2]}
```

### 3.5 Preview Generator

Create `apps/processor/preview/render.py`:
```python
def generate_preview(pdf_bytes: bytes, watermark_text: str = "APOLLO MC PREVIEW") -> bytes:
    """
    Generates a degraded preview JPEG from the production PDF.
    - Renders first 2 pages only
    - Downsamples to 72dpi (production is 300dpi)
    - Applies semi-transparent watermark across center
    - Returns JPEG bytes for S3 upload to previews/ prefix
    """
    pass  # Full implementation using pdf2image + Pillow
```

### 3.6 Lambda Handler

Create `apps/processor/handler.py`:
```python
import json
import boto3
from extractor.pdf import extract_pdf
from extractor.docx import extract_docx
from extractor.brand import extract_brand_rules
from assembler.plan_builder import build_plan_md
from watermark.steg import embed_buyer_id
from preview.render import generate_preview

s3 = boto3.client('s3')
BUCKET = 'apollo-outputs-private'

def handler(event, context):
    """
    Routes processor jobs based on event.job_type:
    - extract: run extraction on uploaded file
    - assemble: build PLAN.md from mission data
    - watermark: embed buyer ID in completed output
    - preview: generate degraded preview
    """
    job_type = event.get('job_type')
    
    if job_type == 'extract':
        return handle_extraction(event)
    elif job_type == 'assemble':
        return handle_assembly(event)
    elif job_type == 'watermark':
        return handle_watermark(event)
    elif job_type == 'preview':
        return handle_preview(event)
    else:
        raise ValueError(f"Unknown job_type: {job_type}")
```

**Acceptance:** `python -m pytest apps/processor/tests/` all green. Lambda deploys without error.

---

## PHASE 4 — NEXT.JS PORTAL — FOUNDATION

**Goal:** Supabase auth, protected routing, navigation shell.

### 4.1 Setup

```bash
cd apps/portal
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install zustand react-query lucide-react
```

### 4.2 Supabase Client

Create `apps/portal/lib/supabase/client.ts` — browser client.
Create `apps/portal/lib/supabase/server.ts` — server client using cookies.
Create `apps/portal/lib/supabase/middleware.ts` — session refresh middleware.

Add to `middleware.ts` root — protect all `/dashboard`, `/new-mission`, `/mission`, `/review`, `/files` routes. Redirect unauthenticated requests to `/login`.

### 4.3 Auth Pages

Build `/login` — magic link email input, Apollo branding, no password field.
Build `/signup` — email + name + company, magic link confirmation.
Build `/auth/callback` — handles Supabase magic link token exchange.

### 4.4 Navigation Shell

Build `components/shell/AppShell.tsx` with:
- Sidebar: Dashboard, New Mission, My Files, Account
- Top bar: mission status indicator, notification bell, user menu
- Mobile: bottom tab navigation

**Acceptance:** Magic link login flow completes. Protected routes redirect. Shell renders on all screen sizes.

---

## PHASE 5 — CASCADE SELECTOR (GATES 1 + 2 + 3)

**Goal:** The industry → deliverable → style selection flow. This is the module loader for every downstream process.

### 5.1 Gate 1 — Industry Selector

Route: `/new-mission/industry`

Build `components/cascade/IndustryGrid.tsx`:
- Card grid, one card per active industry from `industries` table
- Each card: icon, label, description, deliverable count badge
- Selection writes `industry_id` to mission draft in Supabase
- On select → navigate to `/new-mission/deliverable?industry=[id]`

### 5.2 Gate 2 — Deliverable Selector

Route: `/new-mission/deliverable`

Build `components/cascade/DeliverableList.tsx`:
- Filtered list: `SELECT * FROM deliverable_types WHERE industry_id = $1`
- Each item shows: label, description, estimated pages range, estimated minutes, price
- Include complexity indicator: "4–8 pages · est. 8 min · $65"
- Selection writes `deliverable_type_id` and `quoted_price_cents` to mission
- On select → navigate to `/new-mission/style?deliverable=[id]`

**Key rule:** Style catalog, Launch Pad questions, and task schema are all locked by this selection. Nothing downstream can override it.

### 5.3 Gate 3 — Style Selector

Route: `/new-mission/style`

Build `components/cascade/StyleGallery.tsx`:
- Filtered gallery: `SELECT * FROM style_templates WHERE deliverable_type_id = $1`
- Each card renders a preview image (loaded from `preview_s3_key`)
- Label, description, "Selected" indicator
- Selection writes `style_template_id` and `style_template_version` to mission
- On select → navigate to `/new-mission/intake`

**Version locking:** Write `style_template_version` at selection time. Style can be updated in the library later — this mission always uses the version it selected.

**Acceptance:** Full three-gate flow completes. Mission record in Supabase has `industry_id`, `deliverable_type_id`, `style_template_id`, `style_template_version` all populated. Status = `intake`.

---

## PHASE 6 — LAUNCH PAD INTAKE

**Goal:** Guided, module-specific intake that collects exactly the fields needed for the selected deliverable. Does not launch execution until all required fields are satisfied.

### 6.1 Module Question Definitions

Create `packages/catalog/modules/` — one JSON file per deliverable type defining:
```json
{
  "deliverable_slug": "legal-memo",
  "required_fields": [
    { "key": "client_name", "label": "Client name", "type": "text" },
    { "key": "opposing_party", "label": "Opposing party", "type": "text" },
    { "key": "jurisdiction", "label": "Jurisdiction", "type": "text" },
    { "key": "legal_issue", "label": "Core legal issue", "type": "textarea" },
    { "key": "relevant_statutes", "label": "Relevant statutes", "type": "textarea" },
    { "key": "desired_outcome", "label": "Desired outcome", "type": "textarea" }
  ],
  "optional_fields": [
    { "key": "deadline", "label": "Filing deadline", "type": "date" },
    { "key": "budget_constraint", "label": "Budget constraint", "type": "text" }
  ],
  "file_upload_prompts": [
    { "kind": "reference_doc", "label": "Upload any relevant case files or prior memos" },
    { "kind": "brand_guide", "label": "Upload firm letterhead or brand guidelines (optional)" }
  ],
  "sections": [
    { "key": "issue_statement", "label": "Issue Statement", "min_words": 100, "max_words": 300 },
    { "key": "brief_answer", "label": "Brief Answer", "min_words": 50, "max_words": 150 },
    { "key": "facts", "label": "Statement of Facts", "min_words": 200, "max_words": 600 },
    { "key": "analysis", "label": "Analysis", "min_words": 500, "max_words": 1500 },
    { "key": "conclusion", "label": "Conclusion", "min_words": 100, "max_words": 300 }
  ]
}
```

Create module files for all 17 deliverable types.

### 6.2 Intake UI

Route: `/new-mission/intake`

Build `components/launch-pad/LaunchPad.tsx`:
- Progress bar showing completion percentage across required fields
- One question group at a time — do not show all fields simultaneously
- Field types: text, textarea, multi-select, date, number, file upload
- Completion gate: "Launch Mission" button remains disabled until all required fields have non-empty values
- File upload: POST to `/api/missions/[id]/files` → S3 → trigger extraction Lambda
- Real-time field validation — flag obviously wrong formats before submission
- Auto-save on each field change to `intake_sessions.collected`

**The gate logic:**
```typescript
const allRequiredComplete = module.required_fields.every(
  field => collected[field.key]?.trim().length > 0
)
// Button only enabled when allRequiredComplete === true
```

**Acceptance:** Cannot advance without completing all required fields. Partial sessions survive page refresh (auto-saved to Supabase). File upload triggers extraction Lambda. Extracted JSON writes back to `uploaded_files.extracted_json`.

---

## PHASE 7 — PLAN ASSEMBLY + MISSION BRIEF

**Goal:** Assemble the PLAN.md and present the mission brief approval gate before any execution begins.

### 7.1 Plan Assembly API

Create `apps/portal/api/missions/[id]/assemble/route.ts`:

1. Load mission + deliverable type + style template content from S3
2. Load all `uploaded_files` for mission where `extraction_status = 'complete'`
3. Identify brand guide if uploaded — load its `extracted_json`
4. Call `extract_brand_rules()` if brand guide present
5. Load module question definitions for deliverable type
6. Call `build_plan_md()` with all assembled inputs
7. Write `PLAN.md` to `plans/{mission_id}/PLAN.md` in S3
8. Write assembled `CLAUDE.md` (style template content) to `plans/{mission_id}/CLAUDE.md`
9. Update `missions.plan_md_s3_key` and `missions.claude_md_s3_key`
10. Decompose plan into tasks — one row in `tasks` table per section
11. Build mission brief summary
12. Update `missions.mission_brief` and set `status = 'brief_pending'`

### 7.2 Mission Brief UI

Route: `/new-mission/brief`

Build `components/launch-pad/MissionBrief.tsx`:

Display clearly:
- Deliverable name and description
- Sections that will be built (from section list)
- Estimated page count range
- Estimated build time
- Files received and extraction status
- Style template selected
- Total price
- "Launch Mission" button — triggers approval

On approval:
- POST to `/api/missions/[id]/approve`
- Sets `missions.status = 'queued'`
- Sets `missions.brief_approved_at`
- Enqueues build job
- Navigates to `/mission/[id]` (live job board)

**This gate is non-negotiable. No build starts without it.**

---

## PHASE 8 — JOB QUEUE + EXECUTION ENGINE

**Goal:** Stateful, checkpointed build execution via Claude Code. Each task is atomic, retryable, and logged.

### 8.1 Job Queue

Use Supabase's built-in `pg_cron` extension or a lightweight Node.js worker polling `tasks WHERE status = 'queued' ORDER BY created_at LIMIT 1`.

Worker loop:
```typescript
async function processNextTask() {
  const task = await claimNextTask()  // atomic SELECT ... FOR UPDATE SKIP LOCKED
  if (!task) return

  await updateTaskStatus(task.id, 'running')
  
  try {
    const result = await executeTask(task)
    await writeCheckpoint(task, result)  // S3 staging write
    await updateTaskStatus(task.id, 'complete', result)
    await checkMissionComplete(task.mission_id)
  } catch (err) {
    await handleTaskFailure(task, err)
  }
}
```

### 8.2 Task Execution

`executeTask()` calls Claude API with:
- System prompt: style template CLAUDE.md content
- User prompt: section-specific instructions + all prior section outputs as context
- Structured output schema for the section type
- Provider: `claude-sonnet-4-20250514` primary, `gpt-4o` failover

On schema validation failure:
1. Attempt repair prompt (one time): "Your output did not match the required schema. Here is the error: [error]. Please rewrite to match."
2. If repair fails: switch provider, retry once
3. If both fail: set `task.status = 'failed'`, set `mission.status = 'failed'`, notify user

### 8.3 Mission Completion

When all tasks for a mission reach `complete`:
1. Compile all section checkpoints from S3 staging in `section_index` order
2. Render final document (PDF via Playwright/Chromium or DOCX via docx-js)
3. Run quality gate: Claude Vision API reviews rendered output
4. If quality gate passes: write to `outputs/{mission_id}/v1/`, update `outputs` table
5. Generate degraded preview via `apollo-processor` preview Lambda
6. Set `missions.status = 'review'`
7. Send email notification via SES: "Your [Deliverable] is ready for review"

### 8.4 Live Job Board

Route: `/mission/[id]`

Build `components/job-board/MissionStatus.tsx`:
- Real-time task progress via Supabase Realtime subscription on `tasks`
- Progress bar: completed tasks / total tasks
- Section list with individual status indicators
- Estimated time remaining
- "Build complete — review your deliverable" CTA when status = `review`

---

## PHASE 9 — REVIEW WINDOW + SECTION REBUILD

**Goal:** Customer reviews the degraded preview, makes edits or triggers section rebuilds, before payment unlocks the production file.

### 9.1 Review UI

Route: `/review/[id]`

Build `components/review/ReviewWindow.tsx`:

Left panel: degraded preview (low-res JPEG, watermarked, served from S3 previews bucket)
Right panel: section editor with two modes:

**Mode 1 — Direct edit (text corrections):**
- Editable text fields per section
- For small corrections: typos, number changes, name corrections
- Changes write to `tasks.output_json` directly
- Triggers recompile without full task requeue

**Mode 2 — Section rebuild:**
- "Rebuild this section" button per section
- Opens a micro-intake: "What should change about this section?" (text input)
- Creates a new task with the feedback appended to the original prompt
- Only that section reruns — rest of document preserved
- Rebuilds are tracked: `tasks.attempt_count` increments
- New checkpoint written when complete

**Session rebuild limit:** 3 section rebuilds included. Additional rebuilds = $10/section upsell (future).

### 9.2 Approve and Pay

When customer is satisfied:
- "Looks good — download" button
- Navigates to payment flow

---

## PHASE 10 — PAYMENT + DELIVERY

**Goal:** Stripe payment gate, watermark injection, signed URL delivery.

### 10.1 Stripe Integration

Create `apps/portal/api/stripe/checkout/route.ts`:
- Creates Stripe PaymentIntent for `missions.quoted_price_cents`
- Associates `mission_id` in metadata
- Returns `client_secret` for Stripe Elements

Create `apps/portal/api/stripe/webhook/route.ts`:
- Verifies `STRIPE_WEBHOOK_SECRET`
- On `payment_intent.succeeded`:
  1. Update `missions.status = 'paid'`
  2. Update `missions.paid_at` and `missions.stripe_charge_id`
  3. Trigger watermark Lambda: embed `user_id` + `mission_id` into production file
  4. Update `outputs.watermark_buyer_id`
  5. Generate delivery token (32-byte random hex, 15-min TTL)
  6. Insert into `delivery_tokens`
  7. Send delivery email via SES with download link
  8. Set `missions.status = 'delivered'`

### 10.2 Delivery API

Create `apps/portal/api/delivery/[token]/route.ts`:
- Look up token in `delivery_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`
- If not found or expired: 404
- If valid:
  1. Generate S3 pre-signed GET URL (15-min expiry)
  2. Mark token `used_at = NOW()`
  3. Log `events` record: `deliverable_downloaded`
  4. Return 302 redirect to pre-signed S3 URL

**The file is never served through the app. The app only redirects to the signed S3 URL. The URL is single-use.**

### 10.3 Customer File System

Route: `/files`

Build `components/files/FileSystem.tsx`:
- All missions for logged-in user, sorted by `created_at DESC`
- Filters: by industry, by deliverable type, by status
- Per mission: deliverable name, date, status, re-download option
- Re-download generates a new delivery token (requires paid status)
- File versioning: if section rebuilds created multiple output versions, show version history

---

## PHASE 11 — EMAIL NOTIFICATIONS

**Goal:** Transactional email via AWS SES for key mission events.

Create templates for:
- `welcome`: account created
- `magic_link`: login link
- `brief_ready`: mission brief assembled, approval needed
- `build_started`: mission entered build queue
- `review_ready`: build complete, review your deliverable
- `delivery`: payment confirmed, here is your download link
- `rebuild_complete`: section rebuild finished
- `failed`: build failed, support notified

All emails sent from `missions@apollomc.ai` via SES.

---

## PHASE 12 — STYLE LIBRARY (INITIAL SET)

**Goal:** First CLAUDE.md style files for each deliverable type. These are injected into PLAN.md at assembly time.

Each style file in `packages/style-library/[industry]/[style-slug].md` follows this structure:

```markdown
# [Style Name] — Style Specification
**Version:** 1
**Deliverable type:** [slug]
**Industry:** [industry]

## Typography
- Heading font: [font]
- Body font: [font]
- Heading sizes: H1 [size], H2 [size], H3 [size]
- Body size: [size]
- Line height: [value]

## Color palette
- Primary: #[hex] — use for headings, key callouts
- Secondary: #[hex] — use for section dividers, accent blocks
- Body text: #[hex]
- Background: #[hex]

## Layout rules
- Page margins: [values]
- Section spacing: [values]
- Column structure: [single/two-column where applicable]

## Formatting conventions
- [Specific rules for this industry/style]

## Tone and voice
- [Tone keywords and guidance specific to deliverable type]

## What this style MUST produce
- [Concrete, verifiable output criteria]
- [Page count range]
- [Required sections in required order]
```

Create initial files for all 17 deliverable types across 3 styles each = 51 style files minimum.

---

## PHASE 13 — BILLING ALERTS + MONITORING

**Goal:** AWS cost protection and system observability.

### 13.1 AWS Billing

```bash
# Requires root account to have enabled billing alerts first
aws cloudwatch put-metric-alarm \
  --alarm-name "apollo-billing-25" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --threshold 25 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions [SNS_TOPIC_ARN] \
  --period 86400 \
  --evaluation-periods 1 \
  --statistic Maximum

# Repeat for $50, $100, $250 thresholds
```

### 13.2 Application Monitoring

Log to Supabase `events` table for all key actions:
- `mission_created` | `brief_approved` | `build_started`
- `task_complete` | `task_failed` | `provider_switched`
- `payment_received` | `file_delivered`
- `section_rebuild_requested` | `quality_gate_failed`

---

## FINAL ACCEPTANCE TEST

Run this sequence manually end-to-end before declaring any phase complete:

```
1. Create account via magic link
2. Gate 1: Select "Legal" industry
3. Gate 2: Select "Legal Memorandum" — verify price + time estimate shows
4. Gate 3: Select a style — verify filtered gallery showed only legal styles
5. Launch Pad: Complete all required fields — verify gate button was disabled until complete
6. Upload a reference PDF — verify extraction runs and extracted_json populates
7. Advance to Mission Brief — verify all inputs summarized correctly
8. Approve mission — verify status = 'queued', task rows created
9. Watch job board — verify task statuses progress in real time
10. Review window opens — verify degraded preview loads, section edit works
11. Trigger one section rebuild — verify only that task reruns
12. Approve for payment — verify Stripe payment intent created
13. Complete payment — verify webhook fires, watermark Lambda runs
14. Receive delivery email — verify download link works, file is full-res, no watermark visible
15. Attempt to reuse download link — verify 404 (single use)
16. Check /files — verify mission appears with re-download option
```

All 16 steps must pass. Any failure stops launch.

---

## OPERATING RULES — PERMANENT

1. Never execute backend operations without presenting the full proposed sequence to Jon and receiving explicit approval
2. Never touch ATLAS or On Spot infrastructure from Apollo systems
3. All Apollo MCP tools connect to Apollo-specific accounts only
4. Never store credentials in code — environment variables only
5. Never overwrite outputs — append versions with timestamps
6. Never delete missions — archive with `archived_at` timestamp
7. Data integrity first. Reliable completion second. Performance third.
8. Every failure has a runbook. Write it when you encounter it.

---

*Apollo MC — On Spot Solutions LLC — Boston, Massachusetts*
*jon@onspot-solutions.com — support@apollomc.ai*
*Fixed at Your Fingertips.*
