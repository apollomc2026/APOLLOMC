import { expect, test } from '@playwright/test'

test.describe('APOLLO 3 mission control', () => {
  test('accepts natural language, recommends a specialist, and exposes truthful gaps', async ({ page }) => {
    await page.goto('/dashboard')
    const composer = page.getByPlaceholder('Describe what must be accomplished, who it is for, and what you already have…')
    await composer.fill('Prepare a proposal for Acme Facilities for $18,500, due October 15, 2026. The contact is Jordan Lee and our methodology is inspect, remediate, and verify.')
    await page.getByRole('button', { name: 'Send to APOLLO' }).click()
    await expect(page.getByRole('heading', { name: 'proposal' })).toBeVisible()
    await expect(page.getByText('field service proposal · v1.0')).toBeVisible()
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
})
