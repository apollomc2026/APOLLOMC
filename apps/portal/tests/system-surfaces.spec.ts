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
  await expect(page.getByRole('link', { name:'Review and revise' })).toHaveAttribute('href', '/review/mission-demo')
  await page.goto('/telemetry')
  await expect(page.getByRole('heading', { name:'Telemetry' })).toBeVisible()
  await expect(page.getByText('Average readiness')).toBeVisible()
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name:'Settings' })).toBeVisible()
  await expect(page.getByRole('link', { name:'Connect Google Drive' })).toBeVisible()
  await page.getByRole('button', { name:'Save preferences' }).click()
  await expect(page.getByRole('button', { name:'Saved' })).toBeVisible()
})

test('delivered work opens a controlled review and accepts scoped revision directives', async ({ page }) => {
  const conversationResponse = await page.request.get('/api/mission-control/conversation?id=mission-demo')
  expect(conversationResponse.ok()).toBe(true)
  const conversation = await conversationResponse.json()
  expect(conversation.specification.content.facts[0]).toMatchObject({
    normalized_value: '18500 USD',
    source_reference: 'conversation:mission-demo',
    capture_method: 'user',
    verification_state: 'stated',
    sensitivity: 'confidential',
  })
  expect(conversation.specification.approval.unresolved_items_accepted).toEqual([])
  expect(conversation.specification.provenance.fact_origins).toEqual([
    { key: 'value', source: 'user', source_reference: 'conversation:mission-demo' },
  ])
  await page.goto('/review/mission-demo')
  await expect(page.getByRole('heading', { level:1, name:'Field Operations Proposal' })).toBeVisible()
  await expect(page.getByText('SHA-256 · 9df2632a3b61…')).toBeVisible()
  await expect(page.getByRole('heading', { name:'Nothing overwritten.' })).toBeVisible()
  await expect(page.getByText('DRAFT 2')).toBeVisible()
  await expect(page.getByText('DRAFT 1')).toBeVisible()
  await page.getByLabel('Revision target').selectOption('Executive decision brief')
  await page.getByLabel('Describe the required change').fill('Make the approval request more decisive while preserving every commercial term.')
  const revision = page.waitForResponse(response => response.url().endsWith('/api/mission-control/revise') && response.status() === 202)
  await page.getByRole('button', { name:'Create new draft version' }).click()
  await revision
  await expect(page.getByLabel('Describe the required change')).toHaveValue('')
})

test('durable mission URLs restore the server record without browser cache', async ({ page }) => {
  await page.goto('/dashboard?mission=mission-demo')
  await expect(page).toHaveURL(/\/dashboard\?mission=mission-demo$/)
  await expect(page.locator('.mc-panel-heading h2')).toHaveText('field service proposal')
  await expect(page.getByText('100%')).toBeVisible()
  await expect(page.getByText('site-survey.pdf')).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('apollo:mission-control:v1') ?? '{}'))
  expect(stored).toMatchObject({ conversationId: 'mission-demo', readiness: 100, specificationVersion: 3 })
})

test('an approved brief can start execution after a blocked dependency is resolved', async ({ page }) => {
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    const response = await route.fetch()
    const body = await response.json()
    await route.fulfill({ response, json: { ...body, job: null, jobs: [] } })
  })
  let approvalBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/approve', async route => {
    approvalBody = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ execution: { state: 'queued', job_id: 'job-retry' } }) })
  })
  await page.goto('/dashboard?mission=mission-demo')
  const retry = page.getByRole('button', { name: 'Start approved execution' })
  await expect(retry).toBeEnabled()
  await retry.click()
  await expect(page.getByText('queued', { exact: true })).toBeVisible()
  expect(approvalBody).toMatchObject({ conversation_id: 'mission-demo', version: 3, unresolved_items_accepted: [] })
})

test('a blocked workflow retries as a new auditable execution job', async ({ page }) => {
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    const response = await route.fetch()
    const body = await response.json()
    await route.fulfill({ response, json: { ...body, job: { ...body.job, id: 'job-blocked', state: 'blocked', artifact_url: null } } })
  })
  let retryBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/retry', async route => {
    retryBody = route.request().postDataJSON()
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ job_id: 'job-retry-demo', state: 'queued' }) })
  })
  await page.goto('/dashboard?mission=mission-demo')
  await page.getByRole('button', { name: 'Retry resolved execution' }).click()
  await expect(page.getByText('queued', { exact: true })).toBeVisible()
  await expect(page.getByText(/preserved the blocked run for audit/)).toBeVisible()
  expect(retryBody).toEqual({ job_id: 'job-blocked' })
})

test('legacy launch pad converges on the authoritative mission intake', async ({ page }) => {
  await page.goto('/launch-pad?industry=legal&payloads=proposal')
  await expect(page).toHaveURL(/\/new-mission$/)
  await expect(page.getByRole('heading', { name:'Engineer the launch brief.' })).toBeVisible()
})

test('taxonomy-first mission URLs converge on conversational intake', async ({ page }) => {
  for (const legacyPath of ['/new-mission/industry', '/new-mission/deliverable?mission=legacy', '/new-mission/style?mission=legacy', '/new-mission/intake?mission=legacy', '/new-mission/brief?mission=legacy']) {
    await page.goto(legacyPath)
    await expect(page).toHaveURL(/\/new-mission$/)
    await expect(page.getByRole('heading', { name: 'Engineer the launch brief.' })).toBeVisible()
  }
})

test('New Mission opens advanced branded intake and hands off to Mission Control', async ({ page }) => {
  await page.goto('/dashboard')
  await page.getByRole('link', { name:/New Mission/ }).click()
  await expect(page.getByRole('heading', { name:'Engineer the launch brief.' })).toBeVisible()
  await expect(page.getByLabel('Mission brand')).toBeVisible()
  await expect(page.getByLabel('Controlled output')).toHaveValue('PDF')
  await expect(page.getByLabel('Controlled output').locator('option')).toHaveCount(1)
  await expect(page.getByText('Versioned PDF draft delivered to customer-owned Drive custody.')).toBeVisible()
  await expect(page.getByText('AURA CALIBRATION')).toBeVisible()
  await page.getByLabel('What must be accomplished?').fill('Prepare a decisive field service proposal for Acme Facilities covering inspection, remediation, and verification.')
  await page.getByLabel(/Primary audience/).fill('Acme Facilities procurement director')
  await page.getByRole('button', { name:/Initialize controlled mission/ }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.locator('.mc-panel-heading h2')).not.toHaveText('Mission strategy pending')
  await expect(page.locator('.mc-aura').filter({ hasText:'authority' }).getByText('75')).toBeVisible()
})

test('advanced intake hands evidence-derived readiness and specification version to Mission Control', async ({ page }) => {
  let interpretedSpecification: Record<string, unknown> | null = null
  let uploadCount = 0
  await page.route('**/api/mission-control/interpret', async route => {
    const response = await route.fetch()
    const body = await response.json()
    interpretedSpecification = body.specification
    await route.fulfill({ response, json: { ...body, conversation_id: 'mission-evidence', specification_version: 1, readiness: 58 } })
  })
  await page.route('**/api/mission-control/evidence', async route => {
    uploadCount += 1
    if (uploadCount === 2) {
      await route.fulfill({ status: 415, contentType: 'application/json', body: JSON.stringify({ error: 'File content does not match its declared type' }) })
      return
    }
    expect(interpretedSpecification).not.toBeNull()
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        specification: {
          ...interpretedSpecification,
          sources: [{ id: 'evidence-1', name: 'site-notes.txt', status: 'verified' }],
        },
        specification_version: 2,
        readiness: 82,
      }),
    })
  })

  await page.goto('/new-mission')
  await page.getByLabel('What must be accomplished?').fill('Prepare a field operations proposal grounded in the attached verified site notes.')
  await page.getByLabel('Add available evidence').setInputFiles([
    { name: 'site-notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Verified site access and inspection scope.') },
    { name: 'mislabeled.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') },
  ])
  await page.getByRole('button', { name:/Initialize controlled mission/ }).click()

  await expect(page).toHaveURL(/\/dashboard\?mission=mission-evidence$/)
  await expect(page.getByText('82%')).toBeVisible()
  await expect(page.getByRole('heading', { name:/Evidence record/ })).toContainText('1')
  await expect(page.getByText('site-notes.txt')).toBeVisible()
  await expect(page.getByText(/1 rejected without discarding the mission: mislabeled.pdf/)).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('apollo:mission-control:v1') ?? '{}'))
  expect(stored).toMatchObject({ readiness: 82, specificationVersion: 2, conversationId: 'mission-evidence' })
})
