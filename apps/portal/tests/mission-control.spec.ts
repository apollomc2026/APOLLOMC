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
})
