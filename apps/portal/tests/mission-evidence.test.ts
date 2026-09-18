import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import sharp from 'sharp'
import { applyEvidenceSupersessionDecisions, batchEvidenceSources, chunkEvidenceSources, deduplicateEvidenceFacts, deriveEvidenceFacts, evidenceExtractionMode, evidenceFactsFromToolInput, evidenceMagicMatches, evidenceSourceInventory, evidenceToolProperties, evidenceZipTooLarge, extractEvidence, extractionTracesCoverSources, extractLabeledEvidenceFacts, filterSemanticallyUnsupportedEvidenceFacts, normalizeEvidenceMime, prepareEvidenceRetrieval, reconcileEvidenceSupersessions, sanitizeEvidenceBytes, supersessionDecisionsFromToolInput } from '../lib/mission-control/evidence'
import { createMissionFact, mergeMissionFacts, missionFactSourceReferences, specificationProvenance, type DeliverableSpecification } from '../lib/mission-control/contracts'
import { buildContentBlocks, inlineEvidenceByteLimit, OrchestrateError } from '../lib/apollo/orchestrate'
import { mergeEvidenceIntoSpecification } from '../lib/mission-control/evidence-specification'

describe('mission evidence custody', () => {
  it('allows explicit supersession of a source outside the current PDF or image batch',()=>{
    const schema=evidenceToolProperties([{key:'expiration_date',label:'Expiration date'}],['amendment-2'],'PDF',['original-agreement','amendment-1','amendment-2']) as Record<string,{items:{properties:{source_id:{enum:string[]};supersedes_source_ids:{items:{enum:string[]}}}}}>
    expect(schema.expiration_date.items.properties.source_id.enum).toEqual(['amendment-2'])
    expect(schema.expiration_date.items.properties.supersedes_source_ids.items.enum).toEqual(['original-agreement','amendment-1','amendment-2'])
    expect(evidenceFactsFromToolInput({expiration_date:[{value:'June 30, 2027',source_id:'amendment-2',supersedes_source_ids:['original-agreement'],supersession_reason:'Amendment 2 expressly extends and replaces the original expiration date.'}]},[{key:'expiration_date',label:'Expiration date'}],['amendment-2'],['original-agreement','amendment-1','amendment-2'])).toEqual([
      expect.objectContaining({source_reference:'amendment-2',supersession:expect.objectContaining({superseded_source_references:['original-agreement']})}),
    ])
  })

  it('gives every modality pass a sanitized complete source inventory',()=>{
    expect(evidenceSourceInventory([{id:'original',name:'Master Agreement.pdf'},{id:'amendment',name:'Amendment 2\r\nFinal.pdf'}])).toBe('MISSION SOURCE INVENTORY (identifiers and filenames only):\n- original: Master Agreement.pdf\n- amendment: Amendment 2 Final.pdf')
  })

  it('normalizes human evidence wording into an allowed select value',()=>{
    const fields=[{key:'follow_up_required',label:'Follow-up required',type:'select',options:[{value:'none',label:'None'},{value:'parts-order',label:'Parts order — return visit pending parts'},{value:'return-visit',label:'Return visit required'}]}]
    const facts=evidenceFactsFromToolInput({follow_up_required:[{value:'None. No return visit, parts order, or additional corrective action is required.',source_id:'record'}]},fields,['record'])
    expect(facts).toEqual([expect.objectContaining({key:'follow_up_required',value:'none',source_reference:'record'})])
    expect(extractLabeledEvidenceFacts([{id:'record',name:'service.txt',text:'Follow-up required:\nNone. No return visit, parts order, or additional corrective action is required.'}],fields)).toEqual([expect.objectContaining({key:'follow_up_required',value:'none',source_reference:'record'})])
    expect(extractLabeledEvidenceFacts([{id:'quote',name:'quote.txt',text:'Payment terms:\nNet 30'}],[{key:'payment_terms',label:'Payment terms',type:'select',options:['Net 15','Net 30','Net 45']}])).toEqual([expect.objectContaining({key:'payment_terms',value:'Net 30'})])
  })

  it('combines multiple acceptance rows from one evidence source instead of manufacturing a conflict',()=>{
    const rows=['Circuit identification | Labels match schedule | Pass','Fastener torque | 35 in-lb | Pass'].map(value=>createMissionFact({key:'acceptance_criteria',label:'Acceptance criteria',value,source:'evidence',source_reference:'qc-report',confidence:1}))
    expect(mergeMissionFacts([],rows)).toEqual([expect.objectContaining({key:'acceptance_criteria',value:rows.map(row=>row.value).join('\n\n'),verification_state:'verified',source_references:['qc-report'],conflicts:undefined})])
  })

  it('combines evidence-backed financial assumptions as a row collection',()=>{
    const rows=['Opening cash is $250,000','Payroll occurs biweekly'].map(value=>createMissionFact({key:'key_assumptions',label:'Key assumptions',value,source:'evidence',source_reference:'workbook',confidence:1}))
    expect(mergeMissionFacts([],rows)).toEqual([expect.objectContaining({key:'key_assumptions',value:rows.map(row=>row.value).join('\n\n'),verification_state:'verified'})])
  })

  it('promotes a more complete scalar extracted from the same source while preserving real conflicts',()=>{
    const short=createMissionFact({key:'customer_address',label:'Customer address',value:'100 Industrial Way',source:'evidence',source_reference:'estimate',confidence:1})
    const complete=createMissionFact({key:'customer_address',label:'Customer address',value:'100 Industrial Way\nWorcester, MA 01608',source:'evidence',source_reference:'estimate',confidence:1})
    const different=createMissionFact({key:'customer_address',label:'Customer address',value:'200 Industrial Way',source:'evidence',source_reference:'estimate',confidence:1})
    expect(mergeMissionFacts([],[short,complete])).toEqual([expect.objectContaining({value:complete.value,verification_state:'verified'})])
    expect(mergeMissionFacts([],[short,different])).toEqual([expect.objectContaining({verification_state:'conflict'})])
  })

  it('routes every supported evidence form into an immediate extraction mode',()=>{
    expect(evidenceExtractionMode({mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',text:'Extracted document text'})).toBe('text')
    expect(evidenceExtractionMode({mime:'application/pdf'})).toBe('pdf')
    expect(evidenceExtractionMode({mime:'image/jpeg'})).toBe('image')
    expect(evidenceExtractionMode({mime:'image/png'})).toBe('image')
    expect(evidenceExtractionMode({mime:'application/octet-stream'})).toBe('none')
  })
  it('rejects a declared PDF whose bytes are not a PDF', () => {
    expect(evidenceMagicMatches(Buffer.from('not a pdf'), 'application/pdf')).toBe(false)
    expect(evidenceMagicMatches(Buffer.from('%PDF-1.7'), 'application/pdf')).toBe(true)
  })

  it('extracts bounded UTF-8 text for source-grounded execution', async () => {
    const result = await extractEvidence(Buffer.from('Confirmed scope and dates'), 'text/plain')
    expect(result).toEqual({ text: 'Confirmed scope and dates', safeForDirectRetrieval: true })
  })

  it('does not classify ordinary non-zip evidence as a decompression bomb', () => {
    expect(evidenceZipTooLarge(Buffer.from('ordinary evidence'))).toBe(false)
  })

  it('normalizes valid evidence extensions when the browser sends a generic MIME type', () => {
    expect(normalizeEvidenceMime('forecast.xlsx', 'application/octet-stream')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(normalizeEvidenceMime('brief.pdf', '')).toBe('application/pdf')
    expect(normalizeEvidenceMime('brief.pdf', 'image/png')).toBeNull()
    expect(normalizeEvidenceMime('diagnostic.inspect.ndjson', 'application/octet-stream')).toBeNull()
  })

  it('uses the canonical MIME in execution custody even when the browser supplied none', () => {
    const bytes = Buffer.from('%PDF-1.7')
    expect(prepareEvidenceRetrieval(bytes, 'application/pdf', { safeForDirectRetrieval:true })).toEqual({
      bytes,
      mime:'application/pdf',
      derived:false,
    })
  })

  it('removes embedded camera metadata before field images enter evidence custody', async () => {
    const photographed = await sharp({
      create:{ width:4, height:3, channels:3, background:{ r:20, g:80, b:140 } },
    }).jpeg().withMetadata({ orientation:6 }).toBuffer()
    expect((await sharp(photographed).metadata()).exif).toBeDefined()

    const sanitized = await sanitizeEvidenceBytes(photographed, 'image/jpeg')
    const metadata = await sharp(sanitized).metadata()
    expect(metadata.exif).toBeUndefined()
    expect(metadata.icc).toBeUndefined()
    expect(metadata.xmp).toBeUndefined()
    expect(metadata.orientation).toBeUndefined()
    expect(metadata.width).toBe(3)
    expect(metadata.height).toBe(4)
  })

  it('keeps accepted PDFs executable above the image-only five-megabyte ceiling', () => {
    expect(inlineEvidenceByteLimit('application/pdf')).toBe(20 * 1024 * 1024)
    expect(inlineEvidenceByteLimit('image/jpeg')).toBe(5 * 1024 * 1024)
    const pdf = Buffer.alloc(6 * 1024 * 1024, 1)
    const blocks = buildContentBlocks({ uploads:[{ id:'large-pdf', upload_kind:'reference_doc', original_filename:'survey.pdf', content_type:'application/pdf', size_bytes:pdf.length, caption:null, extracted_text:null, bytes:pdf }] } as never, 'Mission evidence')
    expect(blocks.some(block => block.type === 'document')).toBe(true)
  })

  it('fails closed instead of pretending an unreadable attachment was considered', () => {
    const image = Buffer.alloc(5 * 1024 * 1024 + 1, 1)
    expect(() => buildContentBlocks({ uploads:[{ id:'oversize-image', upload_kind:'site_photo', original_filename:'site.jpg', content_type:'image/jpeg', size_bytes:image.length, caption:null, extracted_text:null, bytes:image }] } as never, 'Mission evidence'))
      .toThrowError(OrchestrateError)
  })

  it('converts Office evidence to a hashable text execution artifact', () => {
    const artifact = prepareEvidenceRetrieval(Buffer.from('office zip'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', { text:'=== Forecast ===\nMonth,Closing cash\nJan,125000', safeForDirectRetrieval:false })
    expect(artifact.mime).toBe('text/plain')
    expect(artifact.derived).toBe(true)
    expect(artifact.bytes.toString('utf8')).toContain('Jan,125000')
  })

  it('extracts an uploaded workbook into the execution-safe tabular derivative', async () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ['Month', 'Opening cash', 'Inflows', 'Outflows', 'Closing cash'],
      ['January', 100000, 25000, 18000, 107000],
    ]), 'Base Case')
    const bytes = Buffer.from(XLSX.write(workbook, { type:'buffer', bookType:'xlsx' }))
    const extracted = await extractEvidence(bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    const retrieval = prepareEvidenceRetrieval(bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extracted)
    expect(retrieval.mime).toBe('text/plain')
    expect(retrieval.bytes.toString('utf8')).toContain('=== Base Case ===')
    expect(retrieval.bytes.toString('utf8')).toContain('January,100000,25000,18000,107000')
  })

  it('preserves contradictory values from separate evidence sources for reconciliation', () => {
    const extracted = evidenceFactsFromToolInput({ contract_value:[
      { value:'$18,500', source_id:'proposal' },
      { value:'$19,250', source_id:'work-order' },
    ] }, [{ key:'contract_value', label:'Contract value' }], ['proposal','work-order'])
    expect(extracted).toHaveLength(2)
    const [fact] = mergeMissionFacts([], extracted, new Date('2026-09-14T12:00:00.000Z'))
    expect(fact.verification_state).toBe('conflict')
    expect(fact.conflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({ value:'$18,500', source_reference:'proposal' }),
      expect.objectContaining({ value:'$19,250', source_reference:'work-order' }),
    ]))
  })

  it('selects an explicitly controlling amendment while preserving every superseded candidate', () => {
    const extracted=evidenceFactsFromToolInput({contract_value:[
      {value:'$18,500',source_id:'agreement'},
      {value:'$21,000',source_id:'amendment-1',supersedes_source_ids:['agreement'],supersession_reason:'Amendment 1 expressly replaces Section 4 pricing effective September 1, 2026.'},
    ]},[{key:'contract_value',label:'Contract value'}],['agreement','amendment-1'])
    const reconciled=reconcileEvidenceSupersessions(extracted,new Date('2026-09-16T12:00:00.000Z'))
    expect(reconciled).toEqual([expect.objectContaining({
      value:'$21,000',verification_state:'verified',source_reference:'amendment-1',source_references:['agreement','amendment-1'],
      supersession:{controlling_source_reference:'amendment-1',superseded_source_references:['agreement'],reason:'Amendment 1 expressly replaces Section 4 pricing effective September 1, 2026.'},
      conflicts:expect.arrayContaining([expect.objectContaining({value:'$18,500',source_reference:'agreement'}),expect.objectContaining({value:'$21,000',source_reference:'amendment-1'})]),
    })])
  })

  it('refuses unsupported or ambiguous supersession claims', () => {
    const unsupported=evidenceFactsFromToolInput({contract_value:[
      {value:'$21,000',source_id:'amendment-1',supersedes_source_ids:['missing-source'],supersession_reason:'Purports to replace missing evidence.'},
    ]},[{key:'contract_value',label:'Contract value'}],['agreement','amendment-1'])
    expect(unsupported[0].supersession).toBeUndefined()

    const competing=[
      createMissionFact({key:'contract_value',label:'Contract value',value:'$18,500',source:'evidence',source_reference:'agreement',confidence:1}),
      createMissionFact({key:'contract_value',label:'Contract value',value:'$21,000',source:'evidence',source_reference:'amendment-1',confidence:1,supersession:{controlling_source_reference:'amendment-1',superseded_source_references:['agreement'],reason:'Replaces original price.'}}),
      createMissionFact({key:'contract_value',label:'Contract value',value:'$22,000',source:'evidence',source_reference:'amendment-2',confidence:1}),
    ]
    expect(reconcileEvidenceSupersessions(competing)).toHaveLength(3)
  })

  it('reconciles an amendment discovered outside the original extraction batch', () => {
    const facts=[
      createMissionFact({key:'expiration_date',label:'Expiration date',value:'December 31, 2026',source:'evidence',source_reference:'original',confidence:1}),
      createMissionFact({key:'expiration_date',label:'Expiration date',value:'June 30, 2027',source:'evidence',source_reference:'amendment',confidence:1}),
    ]
    const decisions=supersessionDecisionsFromToolInput({decisions:[{key:'expiration_date',controlling_source_id:'amendment',superseded_source_ids:['original'],reason:'Amendment 2 expressly extends the expiration date through June 30, 2027.'}]},facts)
    const reconciled=applyEvidenceSupersessionDecisions(facts,decisions,new Date('2026-09-16T12:00:00.000Z'))
    expect(reconciled).toEqual([expect.objectContaining({value:'June 30, 2027',source_reference:'amendment',verification_state:'verified',supersession:expect.objectContaining({superseded_source_references:['original']})})])
    expect(missionFactSourceReferences(reconciled[0])).toEqual(['original','amendment'])
  })

  it('rejects cross-batch precedence output that cites the wrong field or unavailable sources', () => {
    const facts=[createMissionFact({key:'expiration_date',label:'Expiration date',value:'December 31, 2026',source:'evidence',source_reference:'original',confidence:1})]
    expect(supersessionDecisionsFromToolInput({decisions:[
      {key:'effective_date',controlling_source_id:'amendment',superseded_source_ids:['original'],reason:'Unsupported cross-field claim.'},
      {key:'expiration_date',controlling_source_id:'amendment',superseded_source_ids:['original'],reason:'Unavailable controlling source.'},
    ]},facts)).toEqual([])
  })

  it('combines complementary narrative evidence with complete source provenance', () => {
    const merged=mergeMissionFacts([], [
      createMissionFact({key:'scope_summary',label:'Scope summary',value:'Reconstruct three equipment foundations.',source:'evidence',source_reference:'scope',confidence:1}),
      createMissionFact({key:'scope_summary',label:'Scope summary',value:'Clean and reseal four vehicle-detection loops.',source:'evidence',source_reference:'estimate',confidence:1}),
    ],new Date('2026-09-16T12:00:00.000Z'))
    expect(merged).toEqual([expect.objectContaining({verification_state:'verified',source_references:['scope','estimate'],value:expect.stringContaining('four vehicle-detection loops')})])
    expect(merged[0].conflicts).toBeUndefined()
    expect(specificationProvenance(merged,'2026-09-16T12:00:00.000Z').fact_origins[0]).toEqual(expect.objectContaining({source_references:['scope','estimate']}))
  })

  it('lets an explicit operator answer adjudicate a surfaced evidence conflict', () => {
    const conflicted = mergeMissionFacts([], [
      createMissionFact({ key:'contract_value', label:'Contract value', value:'$18,500', source:'evidence', source_reference:'proposal', confidence:1 }),
      createMissionFact({ key:'contract_value', label:'Contract value', value:'$19,250', source:'evidence', source_reference:'work-order', confidence:1 }),
    ], new Date('2026-09-14T12:00:00.000Z'))
    expect(conflicted[0].verification_state).toBe('conflict')

    const adjudicated = mergeMissionFacts(conflicted, [createMissionFact({
      key:'contract_value', label:'Contract value', value:'$19,250', source:'user', confidence:1,
    })], new Date('2026-09-14T12:05:00.000Z'))
    expect(adjudicated[0]).toMatchObject({ value:'$19,250', source:'user', verification_state:'stated' })
    expect(adjudicated[0].conflicts).toBeUndefined()
  })

  it('reopens a conflict when later evidence contradicts an operator-adjudicated value', () => {
    const chosen = createMissionFact({ key:'contract_value', label:'Contract value', value:'$19,250', source:'user', confidence:1 })
    const result = mergeMissionFacts([chosen], [createMissionFact({ key:'contract_value', label:'Contract value', value:'$21,000', source:'evidence', source_reference:'amendment', confidence:1 })])
    expect(result[0].verification_state).toBe('conflict')
    expect(result[0].conflicts).toHaveLength(2)
  })

  it('rejects hallucinated fields and invalid source citations from extraction output', () => {
    const extracted = evidenceFactsFromToolInput({ contract_value:[{ value:'$18,500', source_id:'invented-source' }], invented_field:[{ value:'yes', source_id:'proposal' }] }, [{ key:'contract_value', label:'Contract value' }], ['proposal'])
    expect(extracted).toEqual([])
  })

  it('batches every uploaded source without silently dropping later evidence', () => {
    const sources = Array.from({ length:16 }, (_, index) => `source-${index + 1}`)
    const batches = batchEvidenceSources(sources, 4)
    expect(batches).toHaveLength(4)
    expect(batches.flat()).toEqual(sources)
    expect(batchEvidenceSources(sources, 3).flat()).toEqual(sources)
  })

  it('segments long contracts with overlap so clauses beyond the opening pages reach extraction', () => {
    const text='A'.repeat(35_000)
    const chunks=chunkEvidenceSources([{ id:'contract', name:'Warranty.pdf', text }], 16_000, 800)
    expect(chunks).toHaveLength(3)
    expect(chunks.every(chunk => chunk.id === 'contract')).toBe(true)
    expect(chunks[2].text).toBe(text.slice(30_400,46_400))
    expect(chunks.map(chunk => chunk.name)).toEqual(['Warranty.pdf · segment 1/3','Warranty.pdf · segment 2/3','Warranty.pdf · segment 3/3'])
  })

  it('deduplicates repeated multipass findings without losing source custody', () => {
    const repeated=createMissionFact({ key:'technician_name',label:'Technician name',value:'Jon Sargent / On Spot Solutions LLC',source:'evidence',source_reference:'service-record',confidence:1 })
    expect(deduplicateEvidenceFacts([repeated,{...repeated}])).toHaveLength(1)
  })

  it('requires completed multipass custody for every inventoried source',()=>{
    const trace={schema_version:'1.0' as const,mode:'text' as const,source_ids:['scope','estimate'],planned_passes:4,completed_passes:4,recovery_passes:1,reconciliation_passes:1,started_at:'2026-09-17T02:00:00Z',completed_at:'2026-09-17T02:01:00Z',status:'complete' as const}
    expect(extractionTracesCoverSources(['scope','estimate'],[trace])).toBe(true)
    expect(extractionTracesCoverSources(['scope','estimate','missing'],[trace])).toBe(false)
    expect(extractionTracesCoverSources(['scope'],[{...trace,completed_passes:3}])).toBe(false)
    expect(extractionTracesCoverSources(['scope'],[{...trace,reconciliation_passes:0}])).toBe(false)
  })

  it('derives time on site deterministically from evidence-backed arrival and departure', () => {
    const facts=[
      createMissionFact({ key:'arrival_time',label:'Arrival time',value:'12:30 PM',source:'evidence',source_reference:'service-record',confidence:1 }),
      createMissionFact({ key:'departure_time',label:'Departure time',value:'2:30 PM',source:'evidence',source_reference:'service-record',confidence:1 }),
    ]
    expect(deriveEvidenceFacts(facts,'fsr')).toEqual([expect.objectContaining({ key:'time_on_site_hours',value:'2',source:'evidence',verification_state:'verified' })])
  })

  it('recovers schema facts from explicit evidence label aliases before model extraction', () => {
    const facts=extractLabeledEvidenceFacts([{id:'report',name:'Service record',text:'Primary Equipment\nDoorKing 6500/6550 Swing Gate Operator'}],[{key:'equipment_make_model',label:'Equipment make and model',evidence_aliases:['Primary Equipment']}])
    expect(facts).toEqual([expect.objectContaining({key:'equipment_make_model',value:'DoorKing 6500/6550 Swing Gate Operator',source_reference:'report'})])
  })

  it('rejects message recipients as on-site contacts and recommendations as placed parts orders', () => {
    const facts=[
      createMissionFact({key:'customer_contact_onsite',label:'Customer contact on site',value:'Sam Barrette',source:'evidence',source_reference:'report',confidence:1}),
      createMissionFact({key:'follow_up_required',label:'Follow-up required',value:'parts-order',source:'evidence',source_reference:'report',confidence:1}),
    ]
    const source='A text message was sent to Sam Barrette requesting access. Recommend replacement of damaged arms on a future visit.'
    expect(filterSemanticallyUnsupportedEvidenceFacts(facts,[{id:'report',text:source}],'fsr')).toEqual([])
  })

  it('accepts a contact explicitly identified by the schema field label',()=>{
    const fact=createMissionFact({key:'customer_contact_onsite',label:'Customer contact on site',value:'Avery Morgan, Facilities Director',source:'evidence',source_reference:'report',confidence:1})
    const source='Customer contact onsite:\nAvery Morgan, Facilities Director'
    expect(filterSemanticallyUnsupportedEvidenceFacts([fact],[{id:'report',text:source}],'fsr')).toEqual([fact])
  })

  it('accepts structured quote rows with numeric prices but rejects unpriced scope prose',()=>{
    const priced=createMissionFact({key:'line_items',label:'Line items',value:'Field condition assessment | 1 | 8500.00',source:'evidence',source_reference:'estimate',confidence:1})
    const unpriced=createMissionFact({key:'line_items',label:'Line items',value:'Field condition assessment and closeout support',source:'evidence',source_reference:'scope',confidence:1})
    expect(filterSemanticallyUnsupportedEvidenceFacts([priced,unpriced],[{id:'estimate',text:priced.value},{id:'scope',text:unpriced.value}],'quote')).toEqual([priced])
  })

  it('retains explicit conflicts when recalibration combines extraction modes',()=>{
    const facts=reconcileEvidenceSupersessions([
      createMissionFact({key:'site_address',label:'Site address',value:'100 Old Road',source:'evidence',source_reference:'scan-pdf',confidence:1}),
      createMissionFact({key:'site_address',label:'Site address',value:'200 New Road',source:'evidence',source_reference:'site-photo',confidence:1}),
    ])
    const merged=mergeMissionFacts([],facts)
    expect(merged).toEqual([expect.objectContaining({key:'site_address',verification_state:'conflict',conflicts:expect.arrayContaining([
      expect.objectContaining({source_reference:'scan-pdf'}),expect.objectContaining({source_reference:'site-photo'}),
    ])})])
  })

  it('rebases a concurrent evidence upload onto the latest specification without losing earlier custody', () => {
    const prior: DeliverableSpecification = {
      schema_version:'1.0', mission:{ title:'Test', objective:'Test', desired_decision_or_action:'Review', stakes:'low', deadline:null },
      audience:{ primary:['Operator'], secondary:[], knowledge_level:'expert', relationship:'internal', sensitivities:[] },
      artifact:{ recommended_family:'report', recommended_type:'final-qc-report', alternatives_considered:[], rationale:'', required_formats:['pdf'] },
      aura:{ authority:50, warmth:50, technicality:50, restraint:50, urgency:50, prestige:50, visual_density:50, keywords:[], avoid:[] },
      content:{ facts:[], claims:[], requirements:[], sections:[], commercial_terms:{}, obligations:[], assumptions:[], exclusions:[], open_questions:[] },
      sources:[], specialist:{ playbook_id:'qc', playbook_version:'1', risk_flags:[], required_checks:[] },
      presentation:{ brand_profile_id:null, design_profile_id:'default', layout_genre:'report', logo_policy:'cover', signature_policy:'none', watermark_policy:'none' },
      approval:{ status:'draft', approved_by:null, approved_at:null, unresolved_items_accepted:[] },
      provenance:{ fact_origins:[], inferences:[], defaults:[], model_versions:[], created_at:'2026-09-14T12:00:00.000Z' },
    }
    const first = mergeEvidenceIntoSpecification({ prior, evidence:{ id:'first', name:'first.pdf', status:'verified', facts:[] } })
    const second = mergeEvidenceIntoSpecification({ prior:first.specification, evidence:{ id:'second', name:'second.pdf', status:'verified', facts:[] } })
    expect(second.specification.sources.map(source => source.id)).toEqual(['first', 'second'])
  })
})
