import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_NOTIFICATION_RECONCILIATION_SINCE, reconcileTerminalNotifications } from '../lib/executor/notification-reconciler'

describe('terminal notification reconciliation', () => {
  afterEach(()=>{ delete process.env.NOTIFICATION_RECONCILIATION_SINCE })

  it('routes unsent completion and failure alerts through their idempotent claim functions', async () => {
    const complete=vi.fn().mockResolvedValue({ sent:true })
    const fail=vi.fn().mockResolvedValue({ sent:true })
    const list=vi.fn().mockResolvedValue([{ id:'delivered-job',state:'delivered' as const },{ id:'failed-job',state:'failed' as const },{ id:'blocked-job',state:'blocked' as const }])
    const result=await reconcileTerminalNotifications({ userId:'operator',limit:200 },{ list,complete,fail })
    expect(list).toHaveBeenCalledWith(DEFAULT_NOTIFICATION_RECONCILIATION_SINCE,'operator',50)
    expect(complete).toHaveBeenCalledWith('delivered-job')
    expect(fail).toHaveBeenCalledWith('failed-job')
    expect(fail).toHaveBeenCalledWith('blocked-job')
    expect(result).toMatchObject({ checked:3,sent:3 })
  })

  it('honors a valid explicit cutoff and falls back safely from invalid configuration', async () => {
    const list=vi.fn().mockResolvedValue([])
    const dependencies={ list,complete:vi.fn(),fail:vi.fn() }
    process.env.NOTIFICATION_RECONCILIATION_SINCE='2026-10-01T12:00:00Z'
    await reconcileTerminalNotifications({},dependencies)
    expect(list).toHaveBeenLastCalledWith('2026-10-01T12:00:00.000Z',undefined,20)
    process.env.NOTIFICATION_RECONCILIATION_SINCE='not-a-date'
    await reconcileTerminalNotifications({},dependencies)
    expect(list).toHaveBeenLastCalledWith(DEFAULT_NOTIFICATION_RECONCILIATION_SINCE,undefined,20)
  })
})
