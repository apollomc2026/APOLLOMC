import {describe,expect,it,vi} from 'vitest'
import {reconcileStaleLaunches,STALE_ACCEPTED_JOB_MINUTES,STALE_EXECUTION_JOB_MINUTES} from '../lib/executor/launch-reconciler'

describe('stale mission-launch reconciliation',()=>{
  it('fails every bounded accepted job that never acquired a workflow run',async()=>{
    const listAccepted=vi.fn().mockResolvedValue([{id:'job-one'},{id:'job-two'}])
    const failAccepted=vi.fn().mockResolvedValue(true)
    const listExecutions=vi.fn().mockResolvedValue([])
    const failExecution=vi.fn()
    const now=new Date('2026-09-17T12:00:00.000Z')
    const result=await reconcileStaleLaunches({limit:100,now},{listAccepted,failAccepted,listExecutions,failExecution})
    expect(listAccepted).toHaveBeenCalledWith('2026-09-17T11:45:00.000Z',50)
    expect(listExecutions).toHaveBeenCalledWith('2026-09-17T11:00:00.000Z',50)
    expect(failAccepted.mock.calls).toEqual([['job-one','2026-09-17T11:45:00.000Z'],['job-two','2026-09-17T11:45:00.000Z']])
    expect(result).toMatchObject({cutoff:'2026-09-17T11:45:00.000Z',execution_cutoff:'2026-09-17T11:00:00.000Z',checked:2,failed:2,job_ids:['job-one','job-two']})
    expect(STALE_ACCEPTED_JOB_MINUTES).toBe(15)
    expect(STALE_EXECUTION_JOB_MINUTES).toBe(60)
  })

  it('does not manufacture failures when no launch is stranded',async()=>{
    const listAccepted=vi.fn().mockResolvedValue([])
    const failAccepted=vi.fn()
    const listExecutions=vi.fn().mockResolvedValue([])
    const failExecution=vi.fn()
    await expect(reconcileStaleLaunches({now:new Date('2026-09-17T12:00:00.000Z')},{listAccepted,failAccepted,listExecutions,failExecution})).resolves.toMatchObject({checked:0,failed:0})
    expect(failAccepted).not.toHaveBeenCalled()
    expect(failExecution).not.toHaveBeenCalled()
  })

  it('does not report a job that advanced concurrently as failed',async()=>{
    const listAccepted=vi.fn().mockResolvedValue([])
    const failAccepted=vi.fn()
    const listExecutions=vi.fn().mockResolvedValue([{id:'job-now-running'}])
    const failExecution=vi.fn().mockResolvedValue(false)
    await expect(reconcileStaleLaunches({now:new Date('2026-09-17T12:00:00.000Z')},{listAccepted,failAccepted,listExecutions,failExecution})).resolves.toMatchObject({checked:1,failed:0,job_ids:[]})
    expect(failExecution).toHaveBeenCalledWith('job-now-running','2026-09-17T11:00:00.000Z')
  })
})
