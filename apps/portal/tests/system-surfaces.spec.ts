import { expect, test } from '@playwright/test'
import JSZip from 'jszip'

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
  await page.getByLabel('Brand kit name').fill('Imported Operations')
  await page.locator('input[name="file"]').setInputFiles({ name:'brand-guide.pdf', mimeType:'application/pdf', buffer:Buffer.from('%PDF-1.7 test fixture') })
  await page.getByRole('button', { name:'Import brand kit' }).click()
  await expect(page.getByText('Brand guide secured, interpreted, and ready for APOLLO generation.')).toBeVisible()
  await expect(page.getByRole('heading', { name:'Imported Operations' })).toBeVisible()
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

test('mission control presents a command deck with immediate reflight and environment actions', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/overview')).json()
  const successfulFlight = fixture.missions[0].jobs[0]
  await page.route('**/api/mission-control/overview', route => route.fulfill({
    status:200,
    contentType:'application/json',
    json:{ ...fixture, missions:[{
      ...fixture.missions[0],
      job:{ id:'newer-active-reflight', state:'generating', progress_percent:45, message:'Engineering reflight', artifacts:[], created_at:'2026-09-07T13:00:00.000Z' },
      jobs:[{ id:'newer-active-reflight', state:'generating', progress_percent:45, message:'Engineering reflight', artifacts:[], created_at:'2026-09-07T13:00:00.000Z' }, successfulFlight],
    }, ...fixture.missions.slice(1)] },
  }))
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level:1, name:'Mission Control' })).toBeVisible()
  const commandDeck = page.locator('.dashboard-command-deck')
  await expect(commandDeck.getByText('MISSION QUICK ACTIONS')).toBeVisible()
  await expect(commandDeck.getByText('Field Operations Proposal')).toBeVisible()
  await expect(commandDeck.getByText('CURRENT COMMAND')).toBeVisible()
  await expect(commandDeck.getByText('Engineering reflight · 45%')).toBeVisible()
  await expect(commandDeck.getByRole('link', { name:/Track mission/i })).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await expect(commandDeck.getByRole('button', { name:/Regenerate deliverable/i })).toHaveCount(0)
  await expect(commandDeck.getByRole('link', { name:'Telemetry', exact:true })).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await expect(commandDeck.getByRole('link', { name:'Edit mission data' })).toHaveAttribute('href', '/new-mission?mission=mission-demo&edit=1')
  await expect(commandDeck.getByRole('link', { name:'New mission' })).toHaveAttribute('href', '/new-mission')
  const priority = page.locator('.dashboard-mission-row').filter({ hasText:'Field Operations Proposal' })
  await expect(priority.getByRole('link', { name:'Track live' })).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await expect(priority.getByText('45% generating')).toBeVisible()
  await expect(priority.getByRole('link', { name:'Open' })).toHaveAttribute('href', '#reflight')
  await expect(priority.getByRole('link', { name:'Telemetry' })).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await expect(priority.getByRole('link', { name:'Edit' })).toHaveAttribute('href', '/new-mission?mission=mission-demo&edit=1')
})

test('archive, telemetry, and settings are operational surfaces', async ({ page }) => {
  await page.goto('/archive')
  await expect(page.getByRole('heading', { name:'Mission Archive' })).toBeVisible()
  await expect(page.getByRole('heading', { name:'Field Operations Proposal' })).toBeVisible()
  await expect(page.getByRole('link', { name:'Flight controls' })).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await page.goto('/telemetry')
  await expect(page.getByRole('heading', { name:'Telemetry' })).toBeVisible()
  await expect(page.getByText('Average mission progress')).toBeVisible()
  await expect(page.getByText('Delivered documents')).toBeVisible()
  await expect(page.getByText('Launch 01', { exact:true })).toBeHidden()
  await page.getByText('Deployment history', { exact:true }).click()
  await expect(page.getByText('Launch 01', { exact:true })).toBeVisible()
  await expect(page.getByText('Reflight 01', { exact:true })).toBeVisible()
  await expect(page.getByRole('link', { name:'View PDF' }).first()).toHaveAttribute('href', '/api/mission-control/artifact/job-reflight')
  await expect(page.getByRole('link', { name:'Drive' })).toHaveCount(0)
  await expect(page.getByRole('link', { name:'Flight controls' }).first()).toHaveAttribute('href', '/telemetry?mission=mission-demo')
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name:'Settings' })).toBeVisible()
  await expect(page.getByRole('link', { name:'Connect Google Drive' })).toBeVisible()
  await page.getByRole('button', { name:'Save preferences' }).click()
  await expect(page.getByRole('button', { name:'Saved' })).toBeVisible()
})

test('telemetry navigation surfaces failed and newly delivered mission notices', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/overview')).json()
  await page.route('**/api/mission-control/overview', route => route.fulfill({
    status:200,
    contentType:'application/json',
    json:{ ...fixture, missions:[
      { ...fixture.missions[0], id:'ready-mission', job:{ ...fixture.missions[0].job, id:'ready-job', state:'delivered' } },
      { ...fixture.missions[1], id:'failed-mission', job:{ id:'failed-job', state:'failed', progress_percent:25, message:'Document workflow failed safely', artifacts:[] } },
    ] },
  }))
  await page.goto('/dashboard')
  const telemetry = page.locator('.sidebar').getByRole('link', { name:/Telemetry/ })
  await expect(telemetry.locator('.sidebar-telemetry-notices .failed')).toHaveText('1')
  await expect(telemetry.locator('.sidebar-telemetry-notices .ready')).toHaveText('1')
  await telemetry.click()
  await expect(page).toHaveURL(/\/telemetry$/)
  await expect(page.locator('.sidebar').getByRole('link', { name:/Telemetry/ }).locator('.sidebar-telemetry-notices .ready')).toHaveCount(0)
  await expect(page.locator('.sidebar').getByRole('link', { name:/Telemetry/ }).locator('.sidebar-telemetry-notices .failed')).toHaveText('1')
})

test('delivered work opens a controlled review and accepts scoped revision directives', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('apollo:theme', 'dark'))
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
  await page.goto('/telemetry?mission=mission-demo')
  await expect(page.getByRole('heading', { level:1, name:'Field Operations Proposal' })).toBeVisible()
  await expect(page.getByText('SHA-256 · 9df2632a3b61…')).toBeVisible()
  await expect(page.getByRole('heading', { name:'Nothing overwritten.' })).toBeVisible()
  await expect(page.getByText('DRAFT 2')).toBeVisible()
  await expect(page.getByText('DRAFT 1')).toBeVisible()
  const revisionTarget = page.getByLabel('Revision target')
  await expect.poll(() => revisionTarget.evaluate(element => getComputedStyle(element).colorScheme)).toBe('dark')
  await expect.poll(() => revisionTarget.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(11, 16, 23)')
  await expect.poll(() => revisionTarget.locator('option').first().evaluate(element => getComputedStyle(element).color)).toBe('rgb(240, 244, 255)')
  await expect.poll(() => revisionTarget.locator('option').first().evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(11, 16, 23)')
  await page.getByRole('button', { name:'Use light mode' }).click()
  await expect.poll(() => revisionTarget.evaluate(element => getComputedStyle(element).colorScheme)).toBe('light')
  await expect.poll(() => revisionTarget.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)')
  await expect.poll(() => revisionTarget.locator('option').first().evaluate(element => getComputedStyle(element).color)).toBe('rgb(19, 38, 48)')
  await expect.poll(() => revisionTarget.locator('option').first().evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)')
  await revisionTarget.selectOption('Executive decision brief')
  await page.getByLabel('Describe the required change').fill('Make the approval request more decisive while preserving every commercial term.')
  const revision = page.waitForResponse(response => response.url().endsWith('/api/mission-control/revise') && response.status() === 202)
  await page.getByRole('button', { name:'INITIATE DIRECTED REFLIGHT' }).click()
  await revision
  await expect(page.getByLabel('Describe the required change')).toHaveValue('')
})

test('durable mission URLs restore the server record without browser cache', async ({ page }) => {
  await page.goto('/dashboard?mission=mission-demo')
  await expect(page).toHaveURL(/\/telemetry\?mission=mission-demo$/)
  await expect(page.getByRole('heading', { level:1, name:'Field Operations Proposal' })).toBeVisible()
  await expect(page.getByText('DRAFT 2')).toBeVisible()
  await expect(page.getByRole('button', { name:'REGENERATE DELIVERABLE' })).toBeVisible()
})

test('pre-launch mission can be cleared or cancelled with durable archival', async ({ page }) => {
  let archivedConversation:string|null=null
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', route => route.fulfill({ status:200, contentType:'application/json', json:{ ...fixture, job:null, jobs:[] } }))
  await page.route('**/api/mission-control/draft', async route => {
    const body=route.request().postDataJSON()
    archivedConversation=body.conversation_id
    await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ conversation_id:body.conversation_id, status:'archived' }) })
  })
  await page.goto('/new-mission?mission=mission-demo&edit=1')
  await page.getByRole('button',{ name:'Cancel or clear mission' }).click()
  await expect(page.getByRole('dialog',{ name:'Clear this mission draft?' })).toBeVisible()
  await expect(page.getByRole('button',{ name:'Clear & start over' })).toBeVisible()
  await expect(page.getByRole('button',{ name:'Cancel mission' })).toBeVisible()
  await page.getByRole('button',{ name:'Clear & start over' }).click()
  await expect.poll(()=>archivedConversation).toBe('mission-demo')
  await expect(page).toHaveURL(/\/new-mission$/)
  await expect(page.getByText('Standing by')).toBeVisible()
})

test('restored voice turns retain visible confidence and review provenance', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    await route.fulfill({ status:200, contentType:'application/json', json:{
      ...fixture,
      job:null,
      jobs:[],
      turns:[...fixture.turns, { id:'voice-turn', role:'user', content:'Mobilize at 10:30 on September 18.', createdAt:'2026-09-14T18:00:00.000Z', inputChannel:'voice', transcriptionConfidence:.86, criticalReviewRequired:true, criticalReviewConfirmed:true }],
    } })
  })
  await page.goto('/new-mission?mission=mission-demo&edit=1')
  await expect(page.getByText('Voice transcript · 86% confidence · reviewed')).toBeVisible()
})

test('open-decision workbench accepts text in each field', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  const questions = ['Who leads the work?', 'What risks should be highlighted?']
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: {
      ...fixture,
      readiness: 70,
      specification: { ...fixture.specification, approval: { ...fixture.specification.approval, status: 'draft' }, content: { ...fixture.specification.content, open_questions: questions, assumptions: [] } },
      job: null,
      jobs: [],
    } })
  })
  await page.goto('/new-mission?mission=mission-demo&edit=1')
  const answer = page.getByPlaceholder('Your answer (optional)').first()
  await answer.fill('Operations Manager')
  await expect(answer).toHaveValue('Operations Manager')
  await page.getByPlaceholder('Your answer (optional)').nth(1).fill('Lane availability and safe traffic control')
  await expect(page.getByRole('button', { name: 'Submit answered fields' })).toBeEnabled()
})

test('active mission can be overridden to fully autonomous control', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  let policyBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/interpret', async route => {
    policyBody = route.request().postDataJSON()
    const specification = (policyBody as { specification: Record<string, unknown> }).specification as typeof fixture.specification
    await route.fulfill({ status: 200, contentType: 'application/json', json: { acknowledgement: 'Autonomous control engaged.', question: null, question_reason: null, readiness: 100, conversation_id: 'mission-demo', specification_version: 4, changed_facts: [], specification: { ...specification, aura: { ...specification.aura, operator_involvement: 0 } } } })
  })
  await page.route('**/api/mission-control/conversation?id=mission-demo', route => route.fulfill({ status: 200, contentType: 'application/json', json: fixture }))
  await page.goto('/new-mission?mission=mission-demo&edit=1')
  const slider = page.getByLabel('Active mission operator involvement')
  await slider.fill('0')
  await expect(page.getByText('Fully Autonomous', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Apply to active mission' }).click()
  await expect(page.getByText('Autonomous control engaged.')).toBeVisible()
  expect(policyBody).toMatchObject({ conversation_id: 'mission-demo', aura: { operator_involvement: 0 } })
})

test('editing delivered mission facts creates a fresh approval checkpoint', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', route => route.fulfill({ status:200, contentType:'application/json', json:fixture }))
  await page.route('**/api/mission-control/interpret', async route => {
    const request = route.request().postDataJSON()
    await route.fulfill({ status:200, contentType:'application/json', json:{ acknowledgement:'Mission facts updated.', question:null, question_reason:null, readiness:100, conversation_id:'mission-demo', specification_version:4, changed_facts:[], specification:{ ...request.specification, mission:{ ...request.specification.mission, objective:'Updated approved field objective.' }, approval:{ status:'ready', approved_by:null, approved_at:null, unresolved_items_accepted:[] }, content:{ ...request.specification.content, open_questions:[] } } } })
  })
  await page.goto('/new-mission?mission=mission-demo&edit=1')
  await page.getByPlaceholder('Describe what must be accomplished, who it is for, and what you already have…').fill('Update the mission objective to the approved field objective.')
  await page.getByRole('button', { name:'Answer all and continue' }).click()
  await expect(page.getByText('Mission facts updated.')).toBeVisible()
  await expect(page.getByRole('dialog', { name:'Ready for launch.' })).toBeVisible()
})

test('an approved brief can start execution after a blocked dependency is resolved', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    await route.fulfill({ status:200, contentType:'application/json', json: { ...fixture, job: null, jobs: [] } })
  })
  let approvalBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/approve', async route => {
    approvalBody = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ execution: { state: 'queued', job_id: 'job-retry' } }) })
  })
  await page.goto('/new-mission?mission=mission-demo')
  const launchDialog = page.getByRole('dialog', { name: 'Ready for launch.' })
  await expect(launchDialog).toBeVisible({ timeout:15_000 })
  await expect(page.getByRole('link', { name: 'Connect Google Drive custody' })).toHaveAttribute('href', /returnTo=%2Fnew-mission%3Fmission%3Dmission-demo/)
  await launchDialog.locator('.mc-launch-review-document').evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')) })
  await launchDialog.getByLabel('I have reviewed the mission brief and approve it for execution.').check()
  await launchDialog.getByRole('button', { name: 'INITIATE LAUNCH' }).click()
  const launchControl = page.locator('.mc-launch-control')
  await expect(launchControl).toContainText('5')
  await expect(launchControl).toContainText('LIFTOFF', { timeout: 7_000 })
  await expect(page.getByText('queued', { exact: true })).toBeVisible()
  expect(approvalBody).toMatchObject({ conversation_id: 'mission-demo', version: 3, unresolved_items_accepted: [] })
})

test('a blocked workflow retries as a new auditable execution job', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    await route.fulfill({ status:200, contentType:'application/json', json: { ...fixture, job: { ...fixture.job, id: 'job-blocked', state: 'blocked', artifact_url: null } } })
  })
  let retryBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/retry', async route => {
    retryBody = route.request().postDataJSON()
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ job_id: 'job-retry-demo', state: 'queued' }) })
  })
  await page.goto('/new-mission?mission=mission-demo')
  await expect(page.getByRole('button', { name:'Retry resolved execution' })).toBeVisible({ timeout:15_000 })
  await expect(page.getByRole('link', { name: 'Connect Google Drive custody' })).toHaveAttribute('href', /returnTo=%2Fnew-mission%3Fmission%3Dmission-demo/)
  await page.getByRole('button', { name: 'Retry resolved execution' }).click()
  await expect(page.getByText('queued', { exact: true })).toBeVisible()
  await expect(page.getByText(/preserved the blocked run for audit/)).toBeVisible()
  expect(retryBody).toEqual({ job_id: 'job-blocked' })
})

test('a safely failed workflow can be retried after its dependency is repaired', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  await page.route('**/api/mission-control/conversation?id=mission-demo', route => route.fulfill({ status: 200, contentType: 'application/json', json: { ...fixture, job: { ...fixture.job, id: 'job-failed', state: 'failed', artifact_url: null } } }))
  let retryBody: Record<string, unknown> | null = null
  let notificationBody: Record<string, unknown> | null = null
  await page.route('**/api/mission-control/notify', async route => { notificationBody = route.request().postDataJSON(); await route.fulfill({ status:200, contentType:'application/json', json:{ sent:true } }) })
  await page.route('**/api/mission-control/retry', async route => { retryBody = route.request().postDataJSON(); await route.fulfill({ status: 202, contentType: 'application/json', json: { job_id: 'job-recovered', state: 'queued' } }) })
  await page.goto('/new-mission?mission=mission-demo')
  const failureBanner = page.locator('.mc-failure-banner')
  await expect(failureBanner).toContainText('MISSION LAUNCH FAILED')
  await expect(failureBanner).toContainText('A failure alert is also queued for email delivery.')
  await expect.poll(() => notificationBody).toEqual({ job_id:'job-failed' })
  await expect(failureBanner.getByRole('button', { name: 'Check calibration & retry' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry failed execution' }).click()
  await expect(page.getByText('queued', { exact: true })).toBeVisible()
  expect(retryBody).toEqual({ job_id: 'job-failed' })
})

test('the review workbench recovers a blocked run without labeling it as a draft', async ({ page }) => {
  const fixture = await (await page.request.get('/api/mission-control/conversation?id=mission-demo')).json()
  let conversationLoads = 0
  await page.route('**/api/mission-control/conversation?id=mission-demo', async route => {
    conversationLoads += 1
    const blocked = { ...fixture.job, id:'job-blocked-review', state:conversationLoads > 1?'queued':'blocked', artifacts:[], artifact_url:null, missing_inputs:['google_drive_connection'] }
    await route.fulfill({ status:200, contentType:'application/json', json: { ...fixture, job:blocked, jobs:[blocked,...fixture.jobs] } })
  })
  await page.route('**/api/mission-control/retry', async route => {
    await route.fulfill({ status:202, contentType:'application/json', body:JSON.stringify({ job_id:'job-review-retry', state:'queued' }) })
  })
  await page.goto('/review/mission-demo')
  await expect(page.getByText('EXECUTION 3')).toBeVisible({ timeout:15_000 })
  const retryRequest = page.waitForRequest(request => request.url().endsWith('/api/mission-control/retry') && request.method() === 'POST')
  await page.getByRole('button', { name:'Retry resolved execution' }).click()
  expect((await retryRequest).postDataJSON()).toEqual({ job_id:'job-blocked-review' })
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
  await page.getByRole('link', { name:/New Mission Engineer/ }).click()
  await expect(page.getByRole('heading', { name:'Engineer the launch brief.' })).toBeVisible()
  await expect(page.getByLabel('Mission brand')).toBeVisible()
  await expect(page.getByLabel('Controlled output')).toHaveValue('PDF')
  await expect(page.getByLabel('Controlled output').locator('option')).toHaveCount(1)
  await expect(page.getByText('Versioned PDF draft delivered to customer-owned Drive custody.')).toBeVisible()
  await expect(page.getByText('AURA CALIBRATION')).toBeVisible()
  const involvement = page.getByLabel('Operator involvement')
  await expect(involvement).toHaveValue('30')
  await expect(page.getByText('AUTONOMOUS', { exact:true })).toBeVisible()
  await involvement.fill('80')
  await expect(page.getByText('DIRECTED', { exact:true })).toBeVisible()
  await involvement.fill('30')
  await page.getByLabel('What must be accomplished?').fill('Prepare a decisive field service proposal for Acme Facilities covering inspection, remediation, and verification.')
  await page.getByLabel(/Primary audience/).fill('Acme Facilities procurement director')
  await page.getByRole('button', { name:/Initialize controlled mission/ }).click()
  await expect(page).toHaveURL(/\/new-mission\?draft=1$/)
  await expect(page.getByLabel('Intended deliverable confirmation')).toContainText('proposal')
  await expect(page.getByRole('button', { name:'Approve deliverable type' })).toBeVisible()
  await expect(page.getByRole('button', { name:'Tell Houston what you need' })).toBeVisible()
  await expect(page.locator('.mc-panel-heading h2')).not.toHaveText('Mission strategy pending')
  await expect(page.locator('.mc-aura').filter({ hasText:'authority' }).getByText('75')).toBeVisible()
})

test('New Mission expands a ZIP evidence package into individually reviewable files', async ({ page }) => {
  const zip=new JSZip()
  zip.file('day1/site-notes.txt','Verified site access and inspection scope.')
  zip.file('day1/results.csv','id,result\nL1,PASS')
  const buffer=await zip.generateAsync({ type:'nodebuffer', compression:'DEFLATE' })
  await page.goto('/new-mission')
  const picker=page.getByLabel(/Drop evidence here or choose files/)
  await expect(picker).toHaveAttribute('accept',/\.zip/)
  await picker.setInputFiles({ name:'Flowbird.zip', mimeType:'application/zip', buffer })
  await expect(page.getByText('Flowbird__day1__site-notes.txt')).toBeVisible()
  await expect(page.getByText('Flowbird__day1__results.csv')).toBeVisible()
  await expect(page.getByRole('button',{ name:/Initialize controlled mission/ })).toBeEnabled()
})

test('advanced intake hands evidence-derived readiness and specification version to Mission Control', async ({ page }) => {
  let interpretedSpecification: Record<string, unknown> | null = null
  let interpretCount = 0
  let uploadCount = 0
  await page.route('**/api/mission-control/interpret', async route => {
    interpretCount += 1
    const response = await route.fetch()
    const body = await response.json()
    if (interpretCount === 1) {
      interpretedSpecification = body.specification
      await route.fulfill({ response, json: { ...body, conversation_id: 'mission-evidence', specification_version: 1, readiness: 58 } })
      return
    }
    const request = route.request().postDataJSON()
    expect(request.conversation_id).toBe('mission-evidence')
    expect(request.message).toContain('Reconcile the complete secured evidence set')
    await route.fulfill({ response, json: { ...body, conversation_id:'mission-evidence', specification:request.specification, specification_version:3, readiness:82, question:null, question_reason:null } })
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
          content:{ ...(interpretedSpecification as { content:Record<string,unknown> }).content, facts:[{ key:'site_name',label:'Site name',value:'Acme Facility',normalized_value:'Acme Facility',source:'evidence',source_reference:'evidence-1',capture_method:'file_extraction',confidence:1,verification_state:'verified',sensitivity:'confidential',last_editor:'apollo',updated_at:'2026-09-16T12:00:00.000Z' }] },
        },
        specification_version: 2,
        readiness: 82,
      }),
    })
  })
  await page.route('**/api/mission-control/conversation?id=mission-evidence', route => route.fulfill({ status:404, contentType:'application/json', body:JSON.stringify({ error:'Test mission is available from local handoff only' }) }))

  await page.goto('/new-mission')
  await page.getByLabel('What must be accomplished?').fill('Prepare a field operations proposal grounded in the attached verified site notes.')
  await page.getByLabel(/Drop evidence here or choose files/).setInputFiles([
    { name: 'site-notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Verified site access and inspection scope.') },
    { name: 'mislabeled.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') },
  ])
  await page.getByRole('button', { name:/Initialize controlled mission/ }).click()

  await expect(page).toHaveURL(/\/new-mission\?mission=mission-evidence$/)
  await expect(page.getByText('82%')).toBeVisible()
  await expect(page.getByRole('heading', { name:/Evidence record/ })).toContainText('1')
  await expect(page.getByTitle('site-notes.txt')).toBeVisible()
  await expect(page.getByRole('region',{ name:'Evidence confirmations' })).toContainText('Acme Facility')
  await expect(page.getByRole('region',{ name:'Evidence confirmations' })).toContainText('1 file secured · 1 verified')
  await expect(page.getByRole('region',{ name:'Evidence confirmations' }).getByRole('list',{ name:'Attached evidence files' })).toContainText('site-notes.txt')
  await expect(page.getByRole('button',{ name:'Re-scan evidence' })).toBeVisible()
  await expect(page.getByText(/1 rejected without discarding the mission: mislabeled.pdf/)).toBeVisible()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('apollo:mission-control:v1') ?? '{}'))
  expect(interpretCount).toBe(2)
  expect(stored).toMatchObject({ readiness: 82, specificationVersion: 3, conversationId: 'mission-evidence' })
})
