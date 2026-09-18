import { describe, expect, it } from 'vitest'
import { activeSections, buildUserPromptText, normalizeSectionCollection, outputTokenBudget, recoverWorkmanshipCollection, sectionContractViolations, sourceBoundaryViolations, workmanshipRepairGuidance, type OrchestrateArgs } from '../lib/apollo/orchestrate'
import { getModule } from '../lib/apollo/packages-loader'

function args(slug:string, fields:Record<string,unknown> = {}, uploads:OrchestrateArgs['uploads'] = []):OrchestrateArgs {
  return {
    slug,
    deliverableLabel:slug,
    industryLabel:'Pilot',
    module:getModule(slug)!,
    schema:{},
    style:{ id:'pilot', industry_slug:'field-service', label:'Pilot', description:'Pilot', content:'Pilot' },
    brand:{ slug:'apollo', label:'APOLLO', brand_md:'', logo_file:null, logo_path:null, logo_bytes:null, logo_mime:null },
    fields,
    uploads,
  }
}

describe('optional section evidence boundaries', () => {
  it('keeps every required section while omitting unsupported optional QC sections', () => {
    const sections = activeSections(args('final-qc-report'))
    expect(sections.filter(section => section.required).map(section => section.key)).toEqual(getModule('final-qc-report')!.sections.filter(section => section.required).map(section => section.key))
    expect(sections.map(section => section.key)).not.toContain('test_instruments')
    expect(sections.map(section => section.key)).not.toContain('quality_summary')
    expect(sections.map(section => section.key)).not.toContain('qc_notes')
  })

  it('includes an optional section when its supporting fact exists', () => {
    expect(activeSections(args('final-qc-report', { test_instruments:'Megohmmeter | Insulation resistance' })).map(section => section.key)).toContain('test_instruments')
    expect(activeSections(args('daily-construction-report', { subcontractor_activity:'Sawcutting crew | Loop installation' })).map(section => section.key)).toContain('third_party_activity')
    expect(activeSections(args('investor-update', { asks_of_investors:'Introduce three municipal infrastructure operators' })).map(section => section.key)).toContain('asks')
  })

  it('includes appendix material only when evidence or a mapped supporting fact exists', () => {
    expect(activeSections(args('business-plan')).map(section => section.key)).not.toContain('appendices')
    const upload = { id:'evidence-1', upload_kind:'reference_doc', original_filename:'market-study.pdf', content_type:'application/pdf', size_bytes:100, caption:null, extracted_text:null, bytes:null }
    expect(activeSections(args('business-plan', {}, [upload])).map(section => section.key)).toContain('appendices')
    expect(activeSections(args('board-report', { compliance_updates:'No open regulatory findings' })).map(section => section.key)).toContain('compliance_update')
  })

  it('never asks the model to recreate the renderer-owned proposal cover', () => {
    expect(activeSections(args('proposal', { past_performance:'Verified reference project' })).map(section => section.key)).not.toContain('cover')
    expect(activeSections(args('proposal', { past_performance:'Verified reference project' })).map(section => section.key)).toContain('past_performance')
  })

  it('never asks the model to recreate renderer-owned signature pages', () => {
    expect(activeSections(args('contract-package')).map(section => section.key)).not.toContain('signature_block')
    expect(activeSections(args('sow')).map(section => section.key)).not.toContain('signature_block')
    expect(activeSections(args('engagement-letter')).map(section => section.key)).toContain('acceptance_signatures')
  })

  it('does not ask the model to duplicate layout-owned mastheads', () => {
    expect(activeSections(args('quote')).map(section => section.key)).not.toContain('header')
    expect(activeSections(args('invoice')).map(section => section.key)).not.toEqual(expect.arrayContaining(['header_masthead','bill_to_block']))
    expect(activeSections(args('meeting-minutes')).map(section => section.key)).not.toContain('header')
    expect(activeSections(args('tax-estimate')).map(section => section.key)).not.toContain('header_masthead')
    expect(activeSections(args('change-order')).map(section => section.key)).not.toContain('header')
    expect(activeSections(args('expense-report')).map(section => section.key)).not.toContain('header_masthead')
    expect(activeSections(args('personal-monthly')).map(section => section.key)).not.toContain('header_masthead')
  })

  it('does not prime generation with missing optional fields or client-facing placeholders', () => {
    const module = getModule('federal-proposal')!
    const fields = Object.fromEntries(module.required_fields.map(field => [field.key, field.key === 'solicitation_number' ? 'FAKE-001' : `Verified ${field.label}`]))
    const prompt = buildUserPromptText(args('federal-proposal', fields))
    expect(prompt).not.toContain('Period of Performance')
    expect(prompt).not.toContain('_(not provided)_')
    expect(prompt).toContain('FAKE-001')
  })

  it('turns federal workmanship failures into explicit table construction instructions', () => {
    const guidance = workmanshipRepairGuidance('federal-proposal', ['Federal response requires substantive tables.']).join('\n')
    expect(guidance).toContain('Requirement | Response Section | Compliance | Evidence')
    expect(guidance).toContain('Workstream | Owner | Deliverable | Control')
    expect(guidance).toContain('Markdown table syntax')
  })

  it('instructs presentation missions to produce slide-native decision content', () => {
    const module = getModule('pitch-deck')!
    const fields = Object.fromEntries(module.required_fields.map(field => [field.key, `Verified ${field.label}`]))
    const prompt = buildUserPromptText(args('pitch-deck', fields))
    expect(prompt).toContain('Presentation-native composition')
    expect(prompt).toContain('3–5 concise bullets')
    expect(prompt).toContain('paragraphs under 45 words')
    expect(prompt).toContain('16:9 slide')
  })

  it('instructs long field records to remain shift-handoff native', () => {
    const mission = args('incident-report', Object.fromEntries(getModule('incident-report')!.required_fields.map(field => [field.key, `Verified ${field.label}`])))
    const prompt = buildUserPromptText(mission)
    expect(prompt).toContain('Field-native composition')
    expect(prompt).toContain('Word range: 15–70')
    expect(prompt).toContain('do not add a cover, table of contents, appendix, or duplicate identification section')
  })

  it('treats field service reports as auditable technical service records', () => {
    const mission = args('fsr', Object.fromEntries(getModule('fsr')!.required_fields.map(field => [field.key, `Verified ${field.label}`])))
    const prompt = buildUserPromptText(mission)
    expect(prompt).toContain('technical service record, not an administrative visit summary')
    expect(prompt).toContain('diagnostic chronology')
    expect(prompt).toContain('Never upgrade an uncertain or incomplete result to PASS')
    expect(prompt).toContain('root cause is not proven')
    expect(prompt).toContain('chain-of-custody identifiers or hashes only when present')
  })

  it('reserves a complete structured-output budget for long professional publications', () => {
    expect(outputTokenBudget(args('business-plan'))).toBe(16384)
    expect(outputTokenBudget(args('business-plan'), true)).toBe(16384)
    expect(outputTokenBudget(args('legal-memo'))).toBeGreaterThan(8192)
    expect(outputTokenBudget(args('quote'))).toBe(8192)
  })

  it('gives contract-intelligence recovery concrete table placement and row targets', () => {
    const guidance = workmanshipRepairGuidance('contract-intelligence-review', ['Contract review lacks structured controls.']).join('\n')
    expect(guidance).toContain('status_dashboard')
    expect(guidance).toContain('obligation_matrix')
    expect(guidance).toContain('action_calendar')
    expect(guidance).toContain('twenty substantive data rows')
    expect(guidance).toContain('Source clause/page')
  })

  it('retains the strongest version of each section across workmanship attempts', () => {
    const input=args('contract-intelligence-review')
    const keys=activeSections(input).map(section=>section.key)
    const prose=(key:string)=>({key,label:key,content:'Plain source-grounded narrative.'})
    const table=(key:string)=>({key,label:key,content:'| Item | Status | Source clause/page |\n|---|---|---|\n| Notice | Active | Section 4, page 2 |\n| Claim | Conditional | Section 7, page 4 |'})
    const first={metadata:{title:'First'},sections:keys.map(key=>key==='status_dashboard'?table(key):prose(key))}
    const repair={metadata:{title:'Repair'},sections:keys.map(key=>key==='obligation_matrix'?table(key):prose(key))}
    const recovered=recoverWorkmanshipCollection(input,[first,repair])
    expect((recovered.metadata as {title:string}).title).toBe('Repair')
    const sections=recovered.sections as Array<{key:string;content:string}>
    expect(sections.find(section=>section.key==='status_dashboard')?.content).toContain('| Notice |')
    expect(sections.find(section=>section.key==='obligation_matrix')?.content).toContain('| Notice |')
  })

  it('rejects strategic figures and legal authorities that are not in the approved source corpus', () => {
    expect(sourceBoundaryViolations(args('market-analysis', { budget_for_entry:'$500,000' }), '<p>Budget $500,000; invented TAM $3.1 billion and growth 19%.</p>').join(' ')).toContain('money:3100000000')
    expect(sourceBoundaryViolations(args('market-analysis', { budget_for_entry:'$500,000' }), '<p>Budget $500,000.</p>')).toEqual([])
    expect(sourceBoundaryViolations(args('market-analysis', { budget_for_entry:'$500,000' }), '<p>The $500,000 management-approved budget is available.</p>')).toEqual([])
    expect(sourceBoundaryViolations(args('legal-memo', { relevant_statutes:'Mass. Gen. Laws ch. 30, § 39G' }), '<p>Invented Party v. Example, 2026 WL 123.</p>').join(' ')).toContain('Unsupported case authority')
  })

  it('tells long-form publications to use source-bound figures and authorities', () => {
    expect(buildUserPromptText(args('business-plan'))).toContain('never create a management estimate')
    expect(buildUserPromptText(args('legal-memo'))).toContain('Never invent or recall a citation from model memory')
  })

  it('identifies the exact missing, duplicate, or reordered section key while safely ignoring extras', () => {
    const mission = args('nda')
    const keys = activeSections(mission).map(section => section.key)
    const malformed = { sections:[...keys.slice(1).map(key => ({ key, label:key, content:'Controlled content' })), { key:'unsupported', label:'Unsupported', content:'No' }, { key:keys[1], label:keys[1], content:'Duplicate' }] }
    const violations = sectionContractViolations(mission, malformed).join('\n')
    expect(violations).toContain(`Missing required section keys: ${keys[0]}`)
    expect(violations).not.toContain('unsupported')
    expect(violations).toContain(`Duplicate section keys: ${keys[1]}`)
    expect(violations).toContain('Section order must be:')
  })

  it('deterministically normalizes a keyed section map without rewriting its source-grounded content', () => {
    const mission=args('contract-intelligence-review')
    const keyed=Object.fromEntries(activeSections(mission).map(section => [section.key, { content:`Verified ${section.label}` }]))
    const normalized=normalizeSectionCollection(mission, { metadata:{ title:'Review' }, sections:keyed })
    expect(Array.isArray(normalized.sections)).toBe(true)
    expect((normalized.sections as Array<Record<string,unknown>>).map(section => section.key)).toEqual(activeSections(mission).map(section => section.key))
    expect((normalized.sections as Array<Record<string,unknown>>)[0].content).toBe('Verified Contract Command Summary')
  })
})
