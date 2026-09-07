import { expect, test } from '@playwright/test'

test.describe('APOLLO 3 mission control', () => {
  test('accepts natural language, recommends a specialist, and exposes truthful gaps', async ({ page }) => {
    await page.goto('/dashboard')
    const composer = page.getByPlaceholder('Describe what must be accomplished, who it is for, and what you already have…')
    await composer.fill('Prepare a proposal for Acme Facilities for $18,500, due October 15, 2026. The contact is Jordan Lee and our methodology is inspect, remediate, and verify.')
    await page.getByRole('button', { name: 'Send to APOLLO' }).click()
    await expect(page.getByRole('heading', { name: 'proposal' })).toBeVisible()
    await expect(page.getByText('field service proposal · v1.0')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mission definition' })).toBeVisible()
    await expect(page.locator('dl').getByText('Acme Facilities', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Evidence record/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Assumptions and obligations/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Output strategy' })).toBeVisible()
    await expect(page.getByText(/What should APOLLO use for/).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /brief readiness/ })).toBeDisabled()
  })

  test('remains usable without horizontal overflow on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
    await expect(page.getByRole('heading', { name: 'What are we building?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send to APOLLO' })).toBeVisible()
  })

  test('voice intake streams into the editable mission draft and flags critical values', async ({ page }) => {
    await page.addInitScript(() => {
      class FakeSpeechRecognition {
        continuous = false
        interimResults = false
        lang = ''
        onresult: ((event: unknown) => void) | null = null
        onend: (() => void) | null = null
        onerror: (() => void) | null = null
        start() { (window as unknown as { __apolloRecognition: FakeSpeechRecognition }).__apolloRecognition = this }
        stop() { this.onend?.() }
        abort() { this.onend?.() }
      }
      Object.defineProperty(window, 'SpeechRecognition', { value: FakeSpeechRecognition, configurable: true })
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: FakeSpeechRecognition, configurable: true })
    })
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Start voice intake' }).click()
    await expect(page.getByRole('button', { name: 'Stop voice intake' })).toBeVisible()
    await page.evaluate(() => {
      const recognition = (window as unknown as { __apolloRecognition: { onresult: (event: unknown) => void } }).__apolloRecognition
      recognition.onresult({
        resultIndex: 0,
        results: Object.assign([{ 0: { transcript: 'Prepare the proposal for $18,500 by 10/15/2026', confidence: 0.71 }, isFinal: true }], { length: 1 }),
      })
    })
    await expect(page.getByPlaceholder('Describe what must be accomplished, who it is for, and what you already have…')).toHaveValue('Prepare the proposal for $18,500 by 10/15/2026')
    await expect(page.getByText(/Review names, dates, amounts, addresses, and obligations before sending/)).toContainText('71% confidence')
  })

  test('requires explicit acceptance before approving a brief with open decisions', async ({ page }) => {
    await page.route('**/api/mission-control/interpret', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        acknowledgement: 'The decision brief is assembled.', question: 'Should the draft use the APOLLO brand?', question_reason: 'Brand custody remains consequential.', readiness: 88, readiness_state: 'ready', changed_facts: [],
        specification: {
          schema_version: '1.0', mission: { title: 'Decision brief', objective: 'Authorize field work', desired_decision_or_action: 'Approve mobilization', stakes: 'medium', deadline: null },
          audience: { primary: ['Operations leadership'], secondary: [], knowledge_level: 'expert', relationship: 'internal', sensitivities: [] },
          artifact: { recommended_family: 'Decision brief', recommended_type: 'proposal', alternatives_considered: [], rationale: 'A proposal supports the decision.', required_formats: ['pdf'] },
          aura: { authority: 80, warmth: 30, technicality: 60, restraint: 70, urgency: 50, prestige: 75, visual_density: 40, keywords: [], avoid: [] },
          content: { facts: [], claims: [], requirements: [], sections: ['Decision'], commercial_terms: {}, obligations: [], assumptions: [], exclusions: [], open_questions: ['Should the draft use the APOLLO brand?'] },
          sources: [], specialist: { playbook_id: 'field-service-proposal', playbook_version: '1.0', risk_flags: [], required_checks: ['source-grounding'] },
          presentation: { brand_profile_id: null, design_profile_id: 'apollo-aerospace-industrial', layout_genre: 'client-decision', logo_policy: 'approved-brand-only', signature_policy: 'optional', watermark_policy: 'none-internal' },
          approval: { status: 'ready', approved_by: null, approved_at: null, unresolved_items_accepted: [] },
          provenance: { fact_origins: [], inferences: [], defaults: [], model_versions: ['test'], created_at: '2026-09-07T00:00:00.000Z' },
        },
      }),
    }))
    await page.goto('/dashboard')
    await page.getByPlaceholder('Describe what must be accomplished, who it is for, and what you already have…').fill('Build the decision brief')
    await page.getByRole('button', { name: 'Send to APOLLO' }).click()
    await expect(page.getByRole('button', { name: 'Accept open decisions to approve' })).toBeDisabled()
    await page.getByRole('checkbox', { name: /explicitly accept them as unresolved/ }).check()
    await expect(page.getByRole('button', { name: 'Review and approve brief' })).toBeEnabled()
  })
})
