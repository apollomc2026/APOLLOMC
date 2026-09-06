import { expect, test } from '@playwright/test'

test('evidence vault loads durable custody records', async ({ page }) => {
  await page.goto('/files')
  await expect(page.getByRole('heading', { name:'Evidence Vault' })).toBeVisible()
  await expect(page.getByText('site-survey.pdf')).toBeVisible()
  await expect(page.getByText('7 verified facts')).toBeVisible()
})

test('brand kit can be created and existing kit upload is available', async ({ page }) => {
  await page.goto('/settings/brand')
  await expect(page.getByRole('heading', { name:'Brand Configuration' })).toBeVisible()
  await page.getByLabel('Brand kit name').fill('Test Operations')
  await page.getByRole('button', { name:'Create brand kit' }).click()
  await expect(page.getByText('Brand kit created and secured in the library.')).toBeVisible()
  await expect(page.getByRole('heading', { name:'Test Operations' })).toBeVisible()
  await page.getByRole('button', { name:'Upload existing' }).click()
  await expect(page.getByText('Upload your existing brand guide')).toBeVisible()
})

test('light theme keeps sidebar readable and persists across pages', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('apollo:theme')) localStorage.setItem('apollo:theme', 'dark') })
  await page.goto('/dashboard')
  const darkSectionColor = await page.getByText('Operations', { exact:true }).evaluate(element => getComputedStyle(element).color)
  expect(darkSectionColor).toBe('rgba(240, 244, 255, 0.48)')
  await page.getByRole('button', { name:'Use light mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const nav = page.getByRole('link', { name:'Mission Control', exact:true })
  await expect(nav).toBeVisible()
  const contrast = await nav.evaluate(element => {
    const foreground = getComputedStyle(element).color
    const background = getComputedStyle(document.querySelector('.sidebar')!).backgroundColor
    return { foreground, background }
  })
  expect(contrast.foreground).not.toBe(contrast.background)
  await page.goto('/files')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('link', { name:'Evidence Vault' })).toBeVisible()
})

test('atmospheric sunburst and starfield respect theme and reduced motion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('apollo:theme', 'dark'))
  await page.goto('/dashboard')
  const atmosphere = await page.locator('.apollo-bg').evaluate(element => {
    const sunburst = getComputedStyle(element.querySelector('.apollo-bg-sunburst')!)
    const farStars = getComputedStyle(element.querySelector('.apollo-bg-stars-far')!)
    const nearStars = getComputedStyle(element.querySelector('.apollo-bg-stars-near')!)
    return {
      sunburst: sunburst.backgroundImage,
      sunburstAnimation: sunburst.animationName,
      farAnimation: farStars.animationName,
      nearAnimation: nearStars.animationName,
    }
  })
  expect(atmosphere.sunburst).toContain('repeating-conic-gradient')
  expect(atmosphere.sunburstAnimation).toBe('sunburstBreathe')
  expect(atmosphere.farAnimation).toBe('starsFlickerFar')
  expect(atmosphere.nearAnimation).toBe('starsFlickerNear')

  await page.emulateMedia({ reducedMotion:'reduce' })
  const reducedDuration = await page.locator('.apollo-bg-stars-near').evaluate(element => parseFloat(getComputedStyle(element).animationDuration))
  expect(reducedDuration).toBeLessThanOrEqual(.001)
})

test('archive, telemetry, and settings are operational surfaces', async ({ page }) => {
  await page.goto('/archive')
  await expect(page.getByRole('heading', { name:'Mission Archive' })).toBeVisible()
  await expect(page.getByRole('heading', { name:'Field Operations Proposal' })).toBeVisible()
  await expect(page.getByRole('link', { name:'Review and revise' })).toHaveAttribute('href', '/dashboard?mission=mission-demo')
  await page.goto('/telemetry')
  await expect(page.getByRole('heading', { name:'Telemetry' })).toBeVisible()
  await expect(page.getByText('Average readiness')).toBeVisible()
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name:'Settings' })).toBeVisible()
  await expect(page.getByRole('button', { name:'Connect Google Drive' })).toBeVisible()
  await page.getByRole('button', { name:'Save preferences' }).click()
  await expect(page.getByRole('button', { name:'Saved' })).toBeVisible()
})

test('legacy launch pad converges on the authoritative mission intake', async ({ page }) => {
  await page.goto('/launch-pad?industry=legal&payloads=proposal')
  await expect(page).toHaveURL(/\/new-mission$/)
  await expect(page.getByRole('heading', { name:'Engineer the launch brief.' })).toBeVisible()
})

test('New Mission opens advanced branded intake and hands off to Mission Control', async ({ page }) => {
  await page.goto('/dashboard')
  await page.getByRole('link', { name:/New Mission/ }).click()
  await expect(page.getByRole('heading', { name:'Engineer the launch brief.' })).toBeVisible()
  await expect(page.getByLabel('Mission brand')).toBeVisible()
  await expect(page.getByText('AURA CALIBRATION')).toBeVisible()
  await page.getByLabel('What must be accomplished?').fill('Prepare a decisive field service proposal for Acme Facilities covering inspection, remediation, and verification.')
  await page.getByLabel(/Primary audience/).fill('Acme Facilities procurement director')
  await page.getByRole('button', { name:/Initialize controlled mission/ }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('.mc-panel-heading h2')).not.toHaveText('Mission strategy pending')
  await expect(page.locator('.mc-aura').filter({ hasText:'authority' }).getByText('75')).toBeVisible()
})
