import { afterEach, describe, expect, it } from 'vitest'
import { failedEmail, missionCompleteEmail } from '../lib/email/ses'

const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
})

describe('mission email surface ownership', () => {
  it('sends delivered mission records directly to Telemetry', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://apollo.example'
    const email = missionCompleteEmail('Final QC Report', 'mission / 7', 'https://drive.example/artifact')
    expect(email.html).toContain('https://apollo.example/telemetry?mission=mission%20%2F%207')
    expect(email.text).not.toContain('/dashboard?mission=')
  })

  it('sends failed missions directly to New Mission calibration', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://apollo.example'
    const email = failedEmail('Federal Proposal', 'mission / 8')
    expect(email.html).toContain('https://apollo.example/new-mission?mission=mission%20%2F%208')
    expect(email.text).not.toContain('/dashboard?mission=')
  })
})
