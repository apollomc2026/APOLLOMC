import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe,expect,it} from 'vitest'

describe('production pilot attestation ledger',()=>{
  const migration=readFileSync(resolve(process.cwd(),'../../supabase/migrations/20260918002000_add_pilot_canary_attestations.sql'),'utf8')
  const canary=readFileSync(resolve(process.cwd(),'lib/pilot/production-canary.ts'),'utf8')

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
})
