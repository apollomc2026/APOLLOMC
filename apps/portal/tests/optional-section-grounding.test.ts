import { describe, expect, it } from 'vitest'
import { activeSections, type OrchestrateArgs } from '../lib/apollo/orchestrate'
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
})
