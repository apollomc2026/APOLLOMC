import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const verificationColumns = [
  'agreement_verification',
  'federal_verification',
  'field_record_verification',
  'commercial_verification',
] as const

describe('document-job verification schema contract', () => {
  it('migrates every deterministic verification record written by the workflow', () => {
    const portalRoot=path.resolve(process.cwd())
    const repositoryRoot=path.resolve(portalRoot, '..', '..')
    const workflow=readFileSync(path.join(portalRoot, 'workflows', 'document-job.ts'), 'utf8')
    const migration=readFileSync(path.join(repositoryRoot, 'supabase', 'migrations', '20260915221422_add_document_job_verification_records.sql'), 'utf8')
    for (const column of verificationColumns) {
      expect(workflow).toContain(`${column}:`)
      expect(migration).toMatch(new RegExp(`add column if not exists ${column} jsonb not null default`))
      expect(migration).toContain(`jsonb_typeof(${column}) = 'object'`)
    }
  })
})
