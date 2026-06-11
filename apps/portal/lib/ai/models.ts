// Single source of truth for model selection. Env-overridable per role.
//
// Claude Sonnet 4 (the dated 2025-05-14 snapshot) retires 2026-06-15. Sonnet
// 4.6 (`claude-sonnet-4-6`) is its documented drop-in replacement
// (platform.claude.com/docs/en/about-claude/models/overview). The 4.6 family
// needs no explicit effort/thinking parameter — it runs on documented defaults.
export type TaskRole =
  | 'draft_compile'      // generate.ts one-shot whole-document
  | 'structured_fill'    // orchestrate.ts primary (tool-forced schema emit)
  | 'repair'             // orchestrate.ts repair + jobs attemptRepair
  | 'section_draft'      // missions executeTask
  | 'extraction'         // brand.py-class tasks (future)

const DEFAULTS: Record<TaskRole, string> = {
  draft_compile:   'claude-sonnet-4-6',
  structured_fill: 'claude-sonnet-4-6',
  repair:          'claude-sonnet-4-6',
  section_draft:   'claude-sonnet-4-6',
  extraction:      'claude-sonnet-4-6', // Haiku 4.5 is the planned experiment for this role — flip via env when validated
}

export function modelFor(role: TaskRole): string {
  return process.env[`APOLLO_MODEL_${role.toUpperCase()}`] ?? DEFAULTS[role]
}
