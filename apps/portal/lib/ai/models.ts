// Single source of truth for model selection. Env-overridable per role.
//
// Claude Sonnet 5 (`claude-sonnet-5`) is the current Sonnet generation.
// APOLLO intentionally relies on the model's defaults: Sonnet 5 rejects manual
// extended-thinking configuration and non-default sampling parameters.
export type TaskRole =
  | 'mission_interpretation' // conversational intent, facts, gaps, recommendation
  | 'draft_compile'      // generate.ts one-shot whole-document
  | 'structured_fill'    // orchestrate.ts primary (tool-forced schema emit)
  | 'repair'             // orchestrate.ts repair + jobs attemptRepair
  | 'section_draft'      // missions executeTask
  | 'extraction'         // brand.py-class tasks (future)

const DEFAULTS: Record<TaskRole, string> = {
  mission_interpretation: 'claude-sonnet-5',
  draft_compile:   'claude-sonnet-5',
  structured_fill: 'claude-sonnet-5',
  repair:          'claude-sonnet-5',
  section_draft:   'claude-sonnet-5',
  extraction:      'claude-sonnet-5', // Haiku 4.5 remains an optional extraction experiment via env override
}

export function modelFor(role: TaskRole): string {
  return process.env[`APOLLO_MODEL_${role.toUpperCase()}`] ?? DEFAULTS[role]
}
