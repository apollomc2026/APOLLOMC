import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe,expect,it} from 'vitest'

describe('production pilot attestation ledger',()=>{
  const migration=readFileSync(resolve(process.cwd(),'../../supabase/migrations/20260918002000_add_pilot_canary_attestations.sql'),'utf8')
  const eventMigration=readFileSync(resolve(process.cwd(),'../../supabase/migrations/20260918013000_add_pilot_canary_events.sql'),'utf8')
  const canary=readFileSync(resolve(process.cwd(),'lib/pilot/production-canary.ts'),'utf8')
  const route=readFileSync(resolve(process.cwd(),'app/api/internal/pilot-canary/route.ts'),'utf8')

  it('is service-only and covers the exact six-class pilot matrix',()=>{
    for(const slug of ['fsr','final-qc-report','quote','proposal','cash-flow-budget-package','contract-intelligence-review'])expect(migration).toContain(`'${slug}'`)
    expect(migration).toContain('enable row level security')
    expect(migration).toContain('revoke all on table public.apollo_pilot_canary_runs from public, anon, authenticated')
    expect(migration).toContain('grant all on table public.apollo_pilot_canary_runs to service_role')
  })

  it('retains deployment, timing, terminal state, structured result, and failure detail',()=>{
    for(const column of ['deployment_id','status','started_at','completed_at','duration_ms','result','error_stage','error_message'])expect(migration).toContain(column)
  })

  it('records stage timing and repair warnings inside the durable result',()=>{
    for(const stage of ['evidence_extraction','specification_and_research','generation_and_repair','initial_render_and_pickup','regeneration_render_and_pickup'])expect(canary).toContain(`mark('${stage}')`)
    expect(canary).toContain('warnings:generated.warnings')
    expect(canary).toContain('timings_ms:timings')
  })

  it('persists a service-only ordered telemetry sequence for each production canary',()=>{
    expect(eventMigration).toContain('references public.apollo_pilot_canary_runs(id) on delete cascade')
    expect(eventMigration).toContain('unique (run_id, sequence)')
    expect(eventMigration).toContain('enable row level security')
    expect(eventMigration).toContain('revoke all on table public.apollo_pilot_canary_events from public, anon, authenticated')
    for(const stage of ['accepted','evidence-inventoried','specification-approved','generation-verified','artifact-picked-up','controlled-failure-rejected','refight-picked-up','passed','failed'])expect(eventMigration).toContain(`'${stage}'`)
    expect(route).toContain("await appendEvent('passed'")
    expect(route).toContain("await appendEvent('failed'")
    expect(route).toContain(".from('apollo_pilot_canary_events')")
  })
})
