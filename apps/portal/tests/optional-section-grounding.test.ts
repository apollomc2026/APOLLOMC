import { describe, expect, it } from 'vitest'
import { activeSections, buildUserPromptText, sectionContractViolations, workmanshipRepairGuidance, type OrchestrateArgs } from '../lib/apollo/orchestrate'
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
})
