import {describe,expect,it} from 'vitest'
import {isRetiredLegacyPath} from '../proxy'

describe('legacy route quarantine',()=>{
  it.each([
    '/api/jobs',
    '/api/missions/mission-1/approve',
    '/api/apollo/submit',
    '/api/apollo/submissions/submission-1',
    '/api/apollo/uploads/upload-1',
    '/api/delivery/legacy-token',
  ])('retires the pre-specification mutation surface %s',path=>{
    expect(isRetiredLegacyPath(path)).toBe(true)
  })

  it.each([
    '/api/v1/document-jobs',
    '/api/mission-control/conversation',
    '/api/mission-control/artifact/job-1',
    '/api/apollo/brands/on-spot-solutions/logo',
    '/api/auth/email-code',
    '/api/billing/checkout',
  ])('preserves the authoritative APOLLO surface %s',path=>{
    expect(isRetiredLegacyPath(path)).toBe(false)
  })
})
