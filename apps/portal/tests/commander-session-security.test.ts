import { describe, expect, test } from 'vitest'
import { isCommanderSessionCurrent } from '../lib/supabase/middleware'

describe('Commander session security',()=>{
  const now=Date.parse('2026-09-19T12:00:00.000Z')

  test('accepts a recently verified Commander session',()=>{
    expect(isCommanderSessionCurrent('2026-09-19T08:00:00.000Z',now,8)).toBe(true)
  })

  test('rejects a session at the hard lifetime boundary',()=>{
    expect(isCommanderSessionCurrent('2026-09-19T04:00:00.000Z',now,8)).toBe(false)
  })

  test('rejects missing, malformed, and future sign-in timestamps',()=>{
    expect(isCommanderSessionCurrent(undefined,now,8)).toBe(false)
    expect(isCommanderSessionCurrent('not-a-date',now,8)).toBe(false)
    expect(isCommanderSessionCurrent('2026-09-19T12:01:00.000Z',now,8)).toBe(false)
  })
})
