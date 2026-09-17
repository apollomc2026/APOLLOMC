import {describe,expect,it,vi} from 'vitest'
import {reconcileStaleLaunches,STALE_ACCEPTED_JOB_MINUTES} from '../lib/executor/launch-reconciler'

describe('stale mission-launch reconciliation',()=>{
  it('fails every bounded accepted job that never acquired a workflow run',async()=>{
    const list=vi.fn().mockResolvedValue([{id:'job-one'},{id:'job-two'}])
    const fail=vi.fn().mockResolvedValue(true)
    const now=new Date('2026-09-17T12:00:00.000Z')
    const result=await reconcileStaleLaunches({limit:100,now},{list,fail})
    expect(list).toHaveBeenCalledWith('2026-09-17T11:45:00.000Z',50)
    expect(fail.mock.calls).toEqual([['job-one','2026-09-17T11:45:00.000Z'],['job-two','2026-09-17T11:45:00.000Z']])
    expect(result).toEqual({cutoff:'2026-09-17T11:45:00.000Z',checked:2,failed:2,job_ids:['job-one','job-two']})
    expect(STALE_ACCEPTED_JOB_MINUTES).toBe(15)
  })

  it('does not manufacture failures when no launch is stranded',async()=>{
    const list=vi.fn().mockResolvedValue([])
    const fail=vi.fn()
    await expect(reconcileStaleLaunches({now:new Date('2026-09-17T12:00:00.000Z')},{list,fail})).resolves.toMatchObject({checked:0,failed:0})
    expect(fail).not.toHaveBeenCalled()
  })

  it('does not report a job that advanced concurrently as failed',async()=>{
    const list=vi.fn().mockResolvedValue([{id:'job-now-running'}])
    const fail=vi.fn().mockResolvedValue(false)
    await expect(reconcileStaleLaunches({now:new Date('2026-09-17T12:00:00.000Z')},{list,fail})).resolves.toMatchObject({checked:1,failed:0,job_ids:[]})
  })
})
