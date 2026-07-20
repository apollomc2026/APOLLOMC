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

CREATE TABLE IF NOT EXISTS industries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(50) UNIQUE NOT NULL,
  label         VARCHAR(100) NOT NULL,
  description   TEXT,
  icon_key      VARCHAR(50),
  sort_order    INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliverable_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS style_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS missions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS intake_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  messages    JSONB DEFAULT '[]',   -- full conversation history
  collected   JSONB DEFAULT '{}',   -- field key → value map
  complete    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS outputs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS delivery_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  output_id     UUID NOT NULL REFERENCES outputs(id),
  mission_id    UUID NOT NULL REFERENCES missions(id),
  token         VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  UUID REFERENCES missions(id),
  user_id     UUID REFERENCES profiles(id),
  event_type  VARCHAR(100) NOT NULL,
  event_data  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_tasks_mission_id ON tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_mission_id ON uploaded_files(mission_id);
CREATE INDEX IF NOT EXISTS idx_outputs_mission_id ON outputs(mission_id);
CREATE INDEX IF NOT EXISTS idx_events_mission_id ON events(mission_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tokens_token ON delivery_tokens(token);
CREATE INDEX IF NOT EXISTS idx_delivery_tokens_expires ON delivery_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_deliverable_types_industry ON deliverable_types(industry_id);
CREATE INDEX IF NOT EXISTS idx_style_templates_deliverable ON style_templates(deliverable_type_id);

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
DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Missions: users see only their own
DROP POLICY IF EXISTS "missions_own" ON missions;
CREATE POLICY "missions_own" ON missions
  FOR ALL USING (auth.uid() = user_id);

-- Intake sessions: via mission ownership
DROP POLICY IF EXISTS "intake_own" ON intake_sessions;
CREATE POLICY "intake_own" ON intake_sessions
  FOR ALL USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Uploaded files: via mission ownership
DROP POLICY IF EXISTS "files_own" ON uploaded_files;
CREATE POLICY "files_own" ON uploaded_files
  FOR ALL USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Tasks: read-only via mission ownership
DROP POLICY IF EXISTS "tasks_read_own" ON tasks;
CREATE POLICY "tasks_read_own" ON tasks
  FOR SELECT USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Outputs: via mission ownership
DROP POLICY IF EXISTS "outputs_own" ON outputs;
CREATE POLICY "outputs_own" ON outputs
  FOR SELECT USING (
    mission_id IN (SELECT id FROM missions WHERE user_id = auth.uid())
  );

-- Catalog tables: public read
DROP POLICY IF EXISTS "industries_public_read" ON industries;
CREATE POLICY "industries_public_read" ON industries FOR SELECT USING (true);
DROP POLICY IF EXISTS "deliverable_types_public_read" ON deliverable_types;
CREATE POLICY "deliverable_types_public_read" ON deliverable_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "style_templates_public_read" ON style_templates;
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

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_missions_updated_at ON missions;
CREATE TRIGGER trg_missions_updated_at
  BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_intake_updated_at ON intake_sessions;
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
