import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe,expect,it} from 'vitest'

const migration=readFileSync(resolve(process.cwd(),'../../supabase/migrations/20260918010000_optimize_legacy_apollo_rls_and_foreign_keys.sql'),'utf8')

describe('legacy APOLLO schema performance hardening',()=>{
  it('retains all six owner policies while evaluating auth identity once per statement',()=>{
    for(const policy of ['profiles_own','missions_own','intake_own','files_own','tasks_read_own','outputs_own']){
      expect(migration).toContain(`create policy ${policy}`)
    }
    expect(migration.match(/\(select auth\.uid\(\)\)/g)).toHaveLength(6)
  })

  it('covers every APOLLO foreign key reported by the hosted advisor',()=>{
    for(const index of [
      'delivery_tokens_mission_id_idx',
      'delivery_tokens_output_id_idx',
      'events_user_id_idx',
      'intake_sessions_mission_id_idx',
      'missions_deliverable_type_id_idx',
      'missions_industry_id_idx',
      'missions_style_template_id_idx',
      'prompt_runs_task_id_idx',
    ])expect(migration).toContain(`create index if not exists ${index}`)
  })

  it('does not mutate isolated THEMIS or CMD tables',()=>{
    expect(migration).not.toMatch(/(?:on|alter|drop|create)\s+public\.(?:themis|cmd)_/i)
  })
})
