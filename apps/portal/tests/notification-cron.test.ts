import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks=vi.hoisted(()=>({ reconcile:vi.fn() }))
vi.mock('../lib/executor/notification-reconciler',()=>({ reconcileTerminalNotifications:mocks.reconcile }))
import { GET } from '../app/api/cron/notifications/route'

describe('notification reconciliation endpoint', () => {
  afterEach(()=>{ delete process.env.CRON_SECRET; mocks.reconcile.mockReset() })

  it('rejects requests without the private scheduler credential', async () => {
    process.env.CRON_SECRET='private-cron-secret'
    const response=await GET(new Request('https://apollo.example/api/cron/notifications'))
    expect(response.status).toBe(401)
    expect(mocks.reconcile).not.toHaveBeenCalled()
  })

  it('runs a bounded reconciliation for the authenticated scheduler', async () => {
    process.env.CRON_SECRET='private-cron-secret'
    mocks.reconcile.mockResolvedValue({ since:'2026-09-14T00:00:00.000Z',checked:1,sent:1,results:[] })
    const response=await GET(new Request('https://apollo.example/api/cron/notifications',{ headers:{ authorization:'Bearer private-cron-secret' } }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ checked:1,sent:1 })
    expect(mocks.reconcile).toHaveBeenCalledOnce()
  })
})
