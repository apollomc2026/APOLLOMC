export type MissionStatus =
  | 'draft'
  | 'intake'
  | 'brief_pending'
  | 'brief_approved'
  | 'queued'
  | 'building'
  | 'review'
  | 'awaiting_payment'
  | 'paid'
  | 'delivered'
  | 'archived'
  | 'failed'

export type TaskStatus = 'queued' | 'running' | 'complete' | 'failed' | 'skipped'

export type ExtractionStatus = 'pending' | 'processing' | 'complete' | 'failed'

export type OutputStatus = 'staged' | 'preview_ready' | 'paid' | 'delivered' | 'superseded'

export type FileKind = 'reference_doc' | 'reference_image' | 'brand_guide' | 'financial_data'

export type UserTier = 'free' | 'gemini' | 'apollo' | 'saturn_v'

export interface Industry {
  id: string
  slug: string
  label: string
  description: string | null
  icon_key: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface DeliverableType {
  id: string
  industry_id: string
  slug: string
  label: string
  description: string | null
  estimated_pages_min: number | null
  estimated_pages_max: number | null
  estimated_minutes: number | null
  base_price_cents: number
  schema_file: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface StyleTemplate {
  id: string
  deliverable_type_id: string
  slug: string
  label: string
  description: string | null
  claude_md_path: string
  preview_s3_key: string | null
  version: number
  active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  tier: UserTier
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  user_id: string
  industry_id: string
  deliverable_type_id: string
  style_template_id: string
  style_template_version: number
  status: MissionStatus
  mission_brief: Record<string, unknown> | null
  project_spec: Record<string, unknown> | null
  plan_md_s3_key: string | null
  claude_md_s3_key: string | null
  quoted_price_cents: number | null
  paid_price_cents: number | null
  stripe_payment_intent: string | null
  stripe_charge_id: string | null
  paid_at: string | null
  brief_approved_at: string | null
  queued_at: string | null
  build_started_at: string | null
  build_completed_at: string | null
  delivered_at: string | null
  expires_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface IntakeSession {
  id: string
  mission_id: string
  messages: Record<string, unknown>[]
  collected: Record<string, string>
  complete: boolean
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: string
  mission_id: string
  kind: FileKind
  original_name: string
  s3_key: string
  mime_type: string | null
  file_size_bytes: number | null
  extracted_json: Record<string, unknown> | null
  extraction_status: ExtractionStatus
  created_at: string
}

export interface Task {
  id: string
  mission_id: string
  task_type: string
  section_key: string | null
  section_index: number | null
  status: TaskStatus
  depends_on: string[] | null
  provider: string | null
  prompt_s3_key: string | null
  output_raw: string | null
  output_json: Record<string, unknown> | null
  schema_valid: boolean | null
  repair_attempts: number
  attempt_count: number
  max_attempts: number
  checkpoint_s3_key: string | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Output {
  id: string
  mission_id: string
  version: number
  format: string
  s3_key_private: string
  s3_key_preview: string | null
  watermark_buyer_id: string | null
  file_size_bytes: number | null
  page_count: number | null
  status: OutputStatus
  created_at: string
}

export interface DeliveryToken {
  id: string
  output_id: string
  mission_id: string
  token: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface Event {
  id: string
  mission_id: string | null
  user_id: string | null
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string
}

export interface PromptRun {
  id: string
  task_id: string
  provider: string
  model: string
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  cost_usd_micro: number | null
  created_at: string
}

// Supabase Database type — using permissive Partial for Insert/Update
// to avoid strict type conflicts with runtime operations.
// In production, generate types with `supabase gen types typescript`.
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: unknown[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
