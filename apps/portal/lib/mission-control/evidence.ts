export interface EvidenceExtraction { text?: string; safeForDirectRetrieval: boolean }
export interface EvidenceRetrievalArtifact { bytes: Buffer; mime: string; derived: boolean }
export const MAX_EVIDENCE_BYTES = 20 * 1024 * 1024
export const MAX_EXECUTABLE_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_EXTRACTED_TEXT_CHARS = 1_000_000

const EVIDENCE_MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', txt: 'text/plain', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
}

export function normalizeEvidenceMime(name: string, declaredMime: string): string | null {
  const extension = name.toLowerCase().split('.').pop() ?? ''
  const expected = EVIDENCE_MIME_BY_EXTENSION[extension]
  if (!expected) return null
  if (!declaredMime || declaredMime === 'application/octet-stream') return expected
  return declaredMime === expected ? expected : null
}
import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages/messages'
import { modelFor } from '@/lib/ai/models'
import { getModule } from '@/lib/apollo/packages-loader'
import { createMissionFact, type FactSupersession, type MissionFact } from './contracts'

type EvidenceField = { key:string; label:string; type?:string; help?:string; evidence_aliases?:string[]; options?:Array<{ value:string; label:string }> }
export interface EvidenceSupersessionDecision { key:string; controlling_source_reference:string; superseded_source_references:string[]; reason:string }

export function evidenceMagicMatches(bytes: Buffer, mime: string): boolean {
  const at = (signature: number[], offset = 0) => signature.every((value, index) => bytes[offset + index] === value)
  if (mime === 'application/pdf') return at([0x25, 0x50, 0x44, 0x46])
  if (mime === 'image/png') return at([0x89, 0x50, 0x4e, 0x47])
  if (mime === 'image/jpeg') return at([0xff, 0xd8, 0xff])
  if (mime.includes('officedocument')) return at([0x50, 0x4b, 0x03, 0x04])
  return mime === 'text/csv' || mime === 'text/plain'
}

/**
 * Re-encode field images before custody so camera GPS, device identity, comments,
 * profiles, and other embedded metadata never enter APOLLO's evidence store.
 * `rotate()` applies EXIF orientation before sharp drops the metadata block.
 */
export async function sanitizeEvidenceBytes(bytes: Buffer, mime: string): Promise<Buffer> {
  if (mime !== 'image/jpeg' && mime !== 'image/png') return bytes
  const sharp = (await import('sharp')).default
  const widths = [4096, 3000, 2200, 1600]
  for (let index = 0; index < widths.length; index++) {
    const image = sharp(bytes, { failOn:'error', limitInputPixels:40_000_000 })
      .rotate()
      .resize({ width:widths[index], height:widths[index], fit:'inside', withoutEnlargement:true })
    const normalized = mime === 'image/jpeg'
      ? await image.jpeg({ quality:[92, 86, 80, 74][index], mozjpeg:true }).toBuffer()
      : await image.png({ compressionLevel:9, adaptiveFiltering:true }).toBuffer()
    if (normalized.length <= MAX_EXECUTABLE_IMAGE_BYTES) return normalized
  }
  throw new Error('Normalized image exceeds executable evidence limit')
}

export function evidenceZipTooLarge(bytes: Buffer, limit = 200 * 1024 * 1024): boolean {
  const floor = Math.max(0, bytes.length - 22 - 65536)
  let eocd = -1
  for (let index = bytes.length - 22; index >= floor; index--) if (bytes.readUInt32LE(index) === 0x06054b50) { eocd = index; break }
  if (eocd < 0) return false
  const count = bytes.readUInt16LE(eocd + 10); let offset = bytes.readUInt32LE(eocd + 16); let total = 0
  for (let index = 0; index < count; index++) {
    if (offset + 46 > bytes.length || bytes.readUInt32LE(offset) !== 0x02014b50) break
    total += bytes.readUInt32LE(offset + 24)
    if (total > limit) return true
    offset += 46 + bytes.readUInt16LE(offset + 28) + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32)
  }
  return false
}

export async function extractEvidence(bytes: Buffer, mime: string): Promise<EvidenceExtraction> {
  if (mime === 'text/plain' || mime === 'text/csv') return { text: bytes.toString('utf8').slice(0, MAX_EXTRACTED_TEXT_CHARS), safeForDirectRetrieval: true }
  if (mime.startsWith('image/')) return { safeForDirectRetrieval: true }
  if (mime === 'application/pdf') {
    try {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(bytes) })
      try { return { text: (await parser.getText()).text?.slice(0, MAX_EXTRACTED_TEXT_CHARS), safeForDirectRetrieval: true } }
      finally { await parser.destroy().catch(() => {}) }
    } catch { return { safeForDirectRetrieval: true } }
  }
  if (mime.includes('wordprocessingml')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: bytes })
    return { text: result.value.slice(0, MAX_EXTRACTED_TEXT_CHARS), safeForDirectRetrieval: false }
  }
  if (mime.includes('spreadsheetml')) {
    const xlsx = await import('xlsx')
    const workbook = xlsx.read(bytes, { type: 'buffer' })
    const text = workbook.SheetNames.flatMap(name => [`=== ${name} ===`, xlsx.utils.sheet_to_csv(workbook.Sheets[name])]).join('\n').slice(0, MAX_EXTRACTED_TEXT_CHARS)
    return { text, safeForDirectRetrieval: false }
  }
  return { safeForDirectRetrieval: false }
}

export function prepareEvidenceRetrieval(bytes: Buffer, normalizedMime: string, extracted: EvidenceExtraction): EvidenceRetrievalArtifact {
  if (extracted.safeForDirectRetrieval) return { bytes, mime: normalizedMime, derived: false }
  if (!extracted.text?.trim()) throw new Error('No retrievable text could be extracted')
  return { bytes:Buffer.from(extracted.text, 'utf8'), mime:'text/plain', derived:true }
}

export async function extractEvidenceFacts(text: string | undefined, moduleSlug: string | null): Promise<MissionFact[]> {
  return extractEvidenceFactsFromSources(text?.trim() ? [{ id: 'evidence', name: 'Evidence', text }] : [], moduleSlug)
}

export type EvidenceExtractionMode='text'|'pdf'|'image'|'none'
export interface EvidenceExtractionTrace {
  schema_version:'1.0'
  mode:EvidenceExtractionMode
  source_ids:string[]
  planned_passes:number
  completed_passes:number
  recovery_passes:number
  started_at:string
  completed_at:string|null
  status:'processing'|'complete'|'failed'
  failure_reason?:string
}

export function createEvidenceExtractionTrace(mode:EvidenceExtractionMode,sourceIds:string[],now=new Date()):EvidenceExtractionTrace {
  return {schema_version:'1.0',mode,source_ids:[...new Set(sourceIds)],planned_passes:0,completed_passes:0,recovery_passes:0,started_at:now.toISOString(),completed_at:null,status:'processing'}
}

function planExtractionPass(trace?:EvidenceExtractionTrace){if(trace)trace.planned_passes+=1}
function completeExtractionPass(trace?:EvidenceExtractionTrace,recovery=false){if(trace){trace.completed_passes+=1;if(recovery)trace.recovery_passes+=1}}
function finishExtractionTrace(trace:EvidenceExtractionTrace,status:'complete'|'failed',reason?:string){trace.status=status;trace.completed_at=new Date().toISOString();if(reason)trace.failure_reason=reason.slice(0,500);return trace}
export function completeEvidenceExtractionTrace(trace:EvidenceExtractionTrace){
  if(trace.planned_passes<1||trace.completed_passes!==trace.planned_passes)return finishExtractionTrace(trace,'failed','Not every planned evidence extraction pass completed')
  return finishExtractionTrace(trace,'complete')
}

export function evidenceExtractionMode(input:{mime:string;text?:string}):EvidenceExtractionMode {
  if(input.text?.trim())return 'text'
  if(input.mime==='application/pdf')return 'pdf'
  if(input.mime==='image/png'||input.mime==='image/jpeg')return 'image'
  return 'none'
}

export async function extractEvidenceFactsFromArtifact(input:{id:string;name:string;mime:string;bytes:Buffer;text?:string},moduleSlug:string|null):Promise<MissionFact[]> {
  return (await extractEvidenceFactsWithTraceFromArtifact(input,moduleSlug)).facts
}

export async function extractEvidenceFactsWithTraceFromArtifact(input:{id:string;name:string;mime:string;bytes:Buffer;text?:string},moduleSlug:string|null):Promise<{facts:MissionFact[];trace:EvidenceExtractionTrace}> {
  const mode=evidenceExtractionMode(input)
  const trace=createEvidenceExtractionTrace(mode,[input.id])
  try {
    let facts:MissionFact[]=[]
    if(mode==='text')facts=await extractEvidenceFactsFromSources([{id:input.id,name:input.name,text:input.text!}],moduleSlug,trace)
    else if(mode==='pdf')facts=await extractEvidenceFactsFromPdfs([{id:input.id,name:input.name,bytes:input.bytes}],moduleSlug,trace)
    else if(mode==='image')facts=await extractEvidenceFactsFromImages([{id:input.id,name:input.name,mime:input.mime as 'image/png'|'image/jpeg',bytes:input.bytes}],moduleSlug,trace)
    if(mode==='none'||trace.planned_passes===0)throw new Error(mode==='none'?'No supported extraction mode was available':'Evidence extraction could not schedule a pass')
    const completed=completeEvidenceExtractionTrace(trace)
    if(completed.status!=='complete')throw new Error(completed.failure_reason)
    return {facts,trace:completed}
  } catch(error) {
    finishExtractionTrace(trace,'failed',error instanceof Error?error.message:'Evidence extraction failed')
    throw Object.assign(error instanceof Error?error:new Error('Evidence extraction failed'),{extractionTrace:trace})
  }
}

export function evidenceFactsFromToolInput(
  input: Record<string, unknown>,
  fields: EvidenceField[],
  sourceIds: string[],
): MissionFact[] {
  const labels = new Map(fields.map(field => [field.key, field.label]))
  return Object.entries(input).flatMap(([key, raw]) => {
    if (!labels.has(key)) return []
    const candidates = Array.isArray(raw) ? raw : [raw]
    return candidates.flatMap(candidate => {
      if (!candidate || typeof candidate !== 'object') return []
      const value = 'value' in candidate && typeof candidate.value === 'string' ? candidate.value.trim() : ''
      const sourceReference = 'source_id' in candidate && typeof candidate.source_id === 'string' && sourceIds.includes(candidate.source_id) ? candidate.source_id : null
      const rawSupersededSourceReferences:unknown[] = 'supersedes_source_ids' in candidate && Array.isArray(candidate.supersedes_source_ids) ? candidate.supersedes_source_ids : []
      const supersededSourceReferences:string[] = [...new Set(rawSupersededSourceReferences.filter((sourceId):sourceId is string => typeof sourceId === 'string' && sourceIds.includes(sourceId) && sourceId !== sourceReference))]
      const supersessionReason = 'supersession_reason' in candidate && typeof candidate.supersession_reason === 'string' ? candidate.supersession_reason.trim() : ''
      const supersession:FactSupersession|undefined = sourceReference && supersededSourceReferences.length && supersessionReason
        ? { controlling_source_reference:sourceReference, superseded_source_references:supersededSourceReferences, reason:supersessionReason.slice(0,1000) }
        : undefined
      return value && sourceReference ? [createMissionFact({ key, label: labels.get(key)!, value:value.slice(0, 2000), source:'evidence', source_reference:sourceReference, confidence:1, sensitivity:'confidential', supersession })] : []
    })
  })
}

export function deduplicateEvidenceFacts(facts:MissionFact[]):MissionFact[] {
  return [...new Map(facts.map(fact => [`${fact.key}:${fact.source_reference ?? ''}:${(fact.normalized_value ?? fact.value).trim().toLocaleLowerCase()}`, fact])).values()]
}

export function reconcileEvidenceSupersessions(facts:MissionFact[], now=new Date()):MissionFact[] {
  const byKey=new Map<string,MissionFact[]>()
  for(const fact of facts)byKey.set(fact.key,[...(byKey.get(fact.key)??[]),fact])
  return [...byKey.values()].flatMap(group=>{
    const declarations=group.filter(fact=>fact.supersession)
    if(!declarations.length)return group
    const referencedSources=new Set(group.map(fact=>fact.source_reference).filter((value):value is string=>Boolean(value)))
    const valid=declarations.filter(fact=>{
      const declaration=fact.supersession!
      return fact.source_reference===declaration.controlling_source_reference
        && referencedSources.has(declaration.controlling_source_reference)
        && declaration.superseded_source_references.every(source=>referencedSources.has(source))
    })
    const controllingSources=[...new Set(valid.map(fact=>fact.supersession!.controlling_source_reference))]
    if(controllingSources.length!==1)return group
    const controlling=group.find(fact=>fact.source_reference===controllingSources[0]&&fact.supersession)
    if(!controlling)return group
    const supersession=controlling.supersession!
    const superseded=new Set(supersession.superseded_source_references)
    const unresolved=group.filter(fact=>fact.source_reference!==controlling.source_reference&&!superseded.has(fact.source_reference??''))
    const controllingValue=(controlling.normalized_value??controlling.value).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()
    if(unresolved.some(fact=>(fact.normalized_value??fact.value).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()!==controllingValue))return group
    return [{
      ...controlling,
      verification_state:'verified' as const,
      source_references:[...referencedSources],
      conflicts:group.map(fact=>({ value:fact.value, normalized_value:fact.normalized_value, source:fact.source, source_reference:fact.source_reference })),
      supersession,
      updated_at:now.toISOString(),
    }]
  })
}

export function supersessionDecisionsFromToolInput(input:Record<string,unknown>,facts:MissionFact[]):EvidenceSupersessionDecision[] {
  const raw=Array.isArray(input.decisions)?input.decisions:[]
  const sourcesByKey=new Map<string,Set<string>>()
  for(const fact of facts){
    if(!fact.source_reference)continue
    const sources=sourcesByKey.get(fact.key)??new Set<string>()
    sources.add(fact.source_reference);sourcesByKey.set(fact.key,sources)
  }
  return raw.flatMap(candidate=>{
    if(!candidate||typeof candidate!=='object')return []
    const key='key' in candidate&&typeof candidate.key==='string'?candidate.key:''
    const controlling='controlling_source_id' in candidate&&typeof candidate.controlling_source_id==='string'?candidate.controlling_source_id:''
    const rawSuperseded:unknown[]='superseded_source_ids' in candidate&&Array.isArray(candidate.superseded_source_ids)?candidate.superseded_source_ids:[]
    const superseded=[...new Set(rawSuperseded.filter((value):value is string=>typeof value==='string'&&value!==controlling))]
    const reason='reason' in candidate&&typeof candidate.reason==='string'?candidate.reason.trim():''
    const available=sourcesByKey.get(key)
    if(!available||!available.has(controlling)||!superseded.length||!superseded.every(source=>available.has(source))||reason.length<12)return []
    return [{key,controlling_source_reference:controlling,superseded_source_references:superseded,reason:reason.slice(0,1000)}]
  })
}

export function applyEvidenceSupersessionDecisions(facts:MissionFact[],decisions:EvidenceSupersessionDecision[],now=new Date()):MissionFact[] {
  const decisionsByKey=new Map<string,EvidenceSupersessionDecision[]>()
  for(const decision of decisions)decisionsByKey.set(decision.key,[...(decisionsByKey.get(decision.key)??[]),decision])
  const annotated=facts.map(fact=>{
    const decisionsForKey=decisionsByKey.get(fact.key)??[]
    const controlling=[...new Map(decisionsForKey.map(decision=>[decision.controlling_source_reference,decision])).values()]
    if(controlling.length!==1||fact.source_reference!==controlling[0].controlling_source_reference)return fact
    const decision=controlling[0]
    return {...fact,supersession:{controlling_source_reference:decision.controlling_source_reference,superseded_source_references:decision.superseded_source_references,reason:decision.reason}}
  })
  return reconcileEvidenceSupersessions(annotated,now)
}

function evidenceExcerpt(text:string,value:string):string {
  const compactValue=value.normalize('NFKC').trim().replace(/\s+/g,' ')
  const probes=[compactValue,compactValue.slice(0,120),compactValue.split(/\n|\.|;/)[0]?.trim()].filter(probe=>probe&&probe.length>=8)
  const normalizedText=text.normalize('NFKC').replace(/\s+/g,' ')
  const lower=normalizedText.toLowerCase()
  const index=probes.map(probe=>lower.indexOf(probe.toLowerCase())).find(candidate=>candidate>=0)??-1
  if(index<0)return normalizedText.slice(0,1800)
  return normalizedText.slice(Math.max(0,index-700),Math.min(normalizedText.length,index+compactValue.length+1100))
}

async function reconcileEvidencePrecedenceAcrossSources(
  facts:MissionFact[],
  sources:Array<{id:string;name:string;text:string}>,
  client:Anthropic,
):Promise<MissionFact[]> {
  const sourceById=new Map<string,{id:string;name:string;text:string}>()
  for(const source of sources){
    const prior=sourceById.get(source.id)
    sourceById.set(source.id,prior?{...prior,text:`${prior.text}\n\n${source.text}`}:{...source})
  }
  const groups=[...new Set(facts.map(fact=>fact.key))].map(key=>facts.filter(fact=>fact.key===key)).filter(group=>{
    const values=new Set(group.map(fact=>(fact.normalized_value??fact.value).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()))
    const sourcesForGroup=new Set(group.map(fact=>fact.source_reference).filter(Boolean))
    return values.size>1&&sourcesForGroup.size>1
  })
  if(!groups.length)return reconcileEvidenceSupersessions(facts)
  const decisions:EvidenceSupersessionDecision[]=[]
  for(const groupBatch of batchEvidenceSources(groups,8)){
    const candidatePacket=groupBatch.map(group=>{
      const fact=group[0]
      const candidates=group.map(candidate=>{
        const source=candidate.source_reference?sourceById.get(candidate.source_reference):null
        return `SOURCE ${candidate.source_reference ?? 'unknown'} (${source?.name??'Unknown source'})\nVALUE: ${candidate.value}\nLOCAL EVIDENCE:\n${source?evidenceExcerpt(source.text,candidate.value):'No readable excerpt available.'}`
      }).join('\n\n')
      return `FIELD ${fact.key} — ${fact.label}\n${candidates}`
    }).join('\n\n==========\n\n')
    const allowedKeys=groupBatch.map(group=>group[0].key)
    const allowedSources=[...new Set(groupBatch.flatMap(group=>group.map(fact=>fact.source_reference).filter((value):value is string=>Boolean(value))))]
    const response=await client.messages.create({
      model:modelFor('extraction'),max_tokens:3000,
      system:'You are APOLLO evidence precedence control. Review contradictory extracted candidates and their local source excerpts. Declare supersession only when the evidence explicitly establishes that one source amends, replaces, overrides, or is the later effective controlling version of another source for that exact field. Upload order, filename alone, apparent completeness, or a higher/lower number never establishes precedence. If control is not explicit, return no decision for that field.',
      tools:[{name:'reconcile_precedence',description:'Return only explicit, evidence-supported source supersession decisions.',input_schema:{type:'object',properties:{decisions:{type:'array',items:{type:'object',properties:{key:{type:'string',enum:allowedKeys},controlling_source_id:{type:'string',enum:allowedSources},superseded_source_ids:{type:'array',items:{type:'string',enum:allowedSources}},reason:{type:'string',description:'Concise evidence-grounded explanation quoting or precisely paraphrasing the controlling amendment, replacement, or effective-date language.'}},required:['key','controlling_source_id','superseded_source_ids','reason']}}},required:['decisions']}}],
      tool_choice:{type:'tool',name:'reconcile_precedence'},messages:[{role:'user',content:candidatePacket}],
    })
    const block=response.content.find(item=>item.type==='tool_use'&&item.name==='reconcile_precedence')
    if(block?.type==='tool_use')decisions.push(...supersessionDecisionsFromToolInput(block.input as Record<string,unknown>,facts))
  }
  return applyEvidenceSupersessionDecisions(facts,decisions)
}

export function extractLabeledEvidenceFacts(
  sources:Array<{ id:string; name:string; text:string }>,
  fields:EvidenceField[],
):MissionFact[] {
  return sources.flatMap(source => {
    const lines=source.text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean)
    return fields.flatMap(field => {
      const aliases=[field.label,...(field.evidence_aliases??[])].map(alias=>alias.trim().toLocaleLowerCase())
      for(let index=0;index<lines.length;index+=1){
        const line=lines[index]
        const normalized=line.replace(/[:\s]+$/,'').toLocaleLowerCase()
        const alias=aliases.find(candidate=>normalized===candidate || normalized.startsWith(`${candidate}:`))
        if(!alias)continue
        const inline=line.slice(alias.length).replace(/^\s*:\s*/,'').trim()
        const value=inline || lines[index+1]?.trim() || ''
        if(value && !aliases.includes(value.toLocaleLowerCase())) return [createMissionFact({key:field.key,label:field.label,value:value.slice(0,2000),source:'evidence',source_reference:source.id,confidence:1,sensitivity:'confidential'})]
      }
      return []
    })
  })
}

function parseClock(value:string):number|null {
  const match=value.trim().match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\b/i)
  if(!match)return null
  let hour=Number(match[1]);const minute=Number(match[2]??0);const meridiem=match[3]?.toLowerCase().startsWith('p')?'pm':match[3]?'am':null
  if(hour>23||minute>59)return null
  if(meridiem){hour%=12;if(meridiem==='pm')hour+=12}
  return hour*60+minute
}

export function deriveEvidenceFacts(facts:MissionFact[],moduleSlug:string|null):MissionFact[] {
  if(moduleSlug!=='fsr')return []
  const byKey=new Map(facts.filter(fact=>fact.verification_state!=='conflict').map(fact=>[fact.key,fact]))
  const derived:MissionFact[]=[]
  if(!byKey.has('time_on_site_hours')){
    const arrival=byKey.get('arrival_time');const departure=byKey.get('departure_time')
    const start=arrival?parseClock(arrival.value):null;const end=departure?parseClock(departure.value):null
    if(start!==null&&end!==null){const duration=((end<start?end+1440:end)-start)/60;if(duration>=0&&duration<=24)derived.push(createMissionFact({ key:'time_on_site_hours',label:'Time on site (hours)',value:String(Number(duration.toFixed(2))),source:'evidence',source_reference:arrival?.source_reference??departure?.source_reference??null,confidence:1,sensitivity:'confidential' }))}
  }
  return derived
}

export function filterSemanticallyUnsupportedEvidenceFacts(
  facts:MissionFact[],
  sources:Array<{ id:string; text:string }>,
  moduleSlug:string|null,
):MissionFact[] {
  if(moduleSlug==='quote')return facts.filter(fact=>{
    const value=fact.value.trim()
    if(/^(?:<unknown>|unknown|not provided|not specified|n\/a|none)$/i.test(value))return false
    if(fact.key==='line_items')return /(?:\$\s?\d|\b(?:usd|dollars?)\b|\d[\d,]*(?:\.\d{2})?\s*(?:each|\/\s*(?:day|hour|unit|deployment)))/i.test(value)
    return true
  })
  if(moduleSlug!=='fsr')return facts
  const textBySource=new Map(sources.map(source=>[source.id,source.text]))
  return facts.filter(fact=>{
    const sourceText=fact.source_reference?textBySource.get(fact.source_reference)??'':''
    if(fact.key==='customer_contact_onsite'){
      const escaped=fact.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
      return new RegExp(`(?:met|on[- ]?site contact|onsite contact|present (?:at|on) (?:the )?site|escorted by|accompanied by)[^.!?\\n]{0,100}${escaped}|${escaped}[^.!?\\n]{0,100}(?:met (?:the )?technician|was present (?:at|on) (?:the )?site|served as (?:the )?on[- ]?site contact)`,'i').test(sourceText)
    }
    if(fact.key==='follow_up_required'&&fact.value==='parts-order'){
      return /\b(?:parts? (?:were |are |has been |have been )?(?:ordered|on order)|purchase order|pending parts receipt|awaiting parts)\b/i.test(sourceText)
    }
    return true
  })
}

export function batchEvidenceSources<T>(sources:T[], batchSize:number):T[][] {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('Evidence batch size must be a positive integer')
  return Array.from({ length:Math.ceil(sources.length / batchSize) }, (_, index) => sources.slice(index * batchSize, (index + 1) * batchSize))
}

export function chunkEvidenceSources(
  sources:Array<{ id:string; name:string; text:string }>,
  chunkSize=16_000,
  overlap=800,
):Array<{ id:string; name:string; text:string }> {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) throw new Error('Evidence chunk size must be a positive integer')
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) throw new Error('Evidence chunk overlap must be smaller than the chunk size')
  return sources.flatMap(source => {
    if (source.text.length <= chunkSize) return [source]
    const chunks:Array<{ id:string; name:string; text:string }> = []
    const step=chunkSize-overlap
    const total=Math.ceil((source.text.length-overlap)/step)
    for (let offset=0,index=0;offset<source.text.length;offset+=step,index+=1) chunks.push({ id:source.id, name:`${source.name} · segment ${index+1}/${total}`, text:source.text.slice(offset,offset+chunkSize) })
    return chunks
  })
}

export async function extractEvidenceFactsFromSources(
  sources: Array<{ id: string; name: string; text?: string }>,
  moduleSlug: string | null,
  trace?:EvidenceExtractionTrace,
): Promise<MissionFact[]> {
  const readable = chunkEvidenceSources(sources.filter(source => source.text?.trim()) as Array<{ id: string; name: string; text: string }>)
  if (!readable.length || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const requiredFields = documentModule.required_fields as EvidenceField[]
  const optionalFields = documentModule.optional_fields as EvidenceField[]
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const facts: MissionFact[] = extractLabeledEvidenceFacts(readable, [...requiredFields,...optionalFields])
  for (const batch of batchEvidenceSources(readable, 4)) {
    const sourceIds = [...new Set(batch.map(source => source.id))]
    const evidenceText = batch.map(source => `=== SOURCE ${source.id}: ${source.name} ===\n${source.text.slice(0, 16000)}`).join('\n\n')
    const fieldPasses=[...batchEvidenceSources(requiredFields,5),optionalFields]
    for(const passFields of fieldPasses){
      if(!passFields.length)continue
      planExtractionPass(trace)
      const properties=evidenceToolProperties(passFields,sourceIds,'source')
      const response=await client.messages.create({ model:modelFor('extraction'),max_tokens:5000,system:'You are one pass in APOLLO multipass evidence ingestion. Extract every requested value explicitly supported by the labeled sources. Never fabricate or silently omit a supported requested field. Return option VALUES exactly when options are provided. Cite the source ID. Preserve contradictions as separate candidates. Do not derive or calculate in this extraction pass.',tools:[{name:'extract_evidence',description:'Return every supported candidate for the requested field group.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:`REQUESTED FIELD PASS:\n${passFields.map(field=>fieldDescriptor(field)).join('\n')}\n\n${evidenceText}`}]})
      completeExtractionPass(trace)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,passFields,sourceIds))
    }
    const found=new Set(facts.map(fact=>fact.key));const missing=requiredFields.filter(field=>!found.has(field.key))
    if(missing.length){
      planExtractionPass(trace)
      const properties=evidenceToolProperties(missing,sourceIds,'source')
      const response=await client.messages.create({model:modelFor('extraction'),max_tokens:5000,system:'This is APOLLO required-field recovery. Search the complete labeled evidence carefully for each missing field, including headings, tables, timelines, conclusions, and recommendations. Return all explicitly supported values with source IDs. Return option VALUES exactly. Leave a field absent only when no source supports it. Never fabricate.',tools:[{name:'extract_evidence',description:'Recover supported required fields missed by earlier extraction passes.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:`MISSING REQUIRED FIELDS:\n${missing.map(field=>fieldDescriptor(field)).join('\n')}\n\n${evidenceText}`}]})
      completeExtractionPass(trace,true)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,missing,sourceIds))
    }
  }
  const supported=filterSemanticallyUnsupportedEvidenceFacts(facts,readable,moduleSlug)
  const deduplicated=deduplicateEvidenceFacts(supported)
  return reconcileEvidencePrecedenceAcrossSources(deduplicateEvidenceFacts([...deduplicated,...deriveEvidenceFacts(deduplicated,moduleSlug)]),readable,client)
}

function fieldDescriptor(field:EvidenceField):string {
  const options=field.options?.length?` Options: ${field.options.map(option=>`${option.value} (${option.label})`).join(', ')}.`:''
  const aliases=field.evidence_aliases?.length?` Evidence may label this as: ${field.evidence_aliases.join(', ')}.`:''
  return `- ${field.key}: ${field.label}${field.type?` [${field.type}]`:''}.${field.help?` ${field.help}`:''}${aliases}${options}`
}

function evidenceToolProperties(fields: EvidenceField[], sourceIds:string[], sourceLabel:'source'|'PDF') {
  return Object.fromEntries(fields.map(field => [field.key, {
    type:'array', description:`${fieldDescriptor(field)} Return one candidate per directly supporting ${sourceLabel}, including every contradictory value.`,
    items:{ type:'object', properties:{ value:{ type:'string', description:`Exact evidence-supported value for ${field.label}` }, source_id:{ type:'string', enum:sourceIds, description:`ID of the ${sourceLabel} that directly supports this candidate` }, supersedes_source_ids:{type:'array',items:{type:'string',enum:sourceIds},description:'Only when this source explicitly amends, replaces, overrides, or supersedes another labeled source for this exact field, list those source IDs.'}, supersession_reason:{type:'string',description:'Exact evidence-grounded reason this candidate controls, including the amendment/replacement language or effective-date relationship. Required when supersedes_source_ids is present.'} }, required:['value','source_id'] },
  }]))
}

export async function extractEvidenceFactsFromPdfs(
  sources: Array<{ id: string; name: string; bytes: Buffer }>,
  moduleSlug: string | null,
  trace?:EvidenceExtractionTrace,
): Promise<MissionFact[]> {
  if (!sources.length || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const requiredFields=documentModule.required_fields as EvidenceField[]
  const optionalFields=documentModule.optional_fields as EvidenceField[]
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const facts: MissionFact[] = []
  for (const batch of batchEvidenceSources(sources, 3)) {
    const sourceIds = batch.map(source => source.id)
    const content: ContentBlockParam[] = batch.flatMap(source => [{ type:'text' as const, text:`SOURCE ID: ${source.id} — ${source.name}` }, { type:'document' as const, title:source.name, source:{ type:'base64' as const, media_type:'application/pdf' as const, data:source.bytes.toString('base64') } }])
    for(const passFields of [...batchEvidenceSources(requiredFields,5),optionalFields]){
      if(!passFields.length)continue
      planExtractionPass(trace)
      const properties=evidenceToolProperties(passFields,sourceIds,'PDF')
      const passContent=[...content,{type:'text' as const,text:`REQUESTED FIELD PASS:\n${passFields.map(field=>fieldDescriptor(field)).join('\n')}\nExtract every explicitly supported value for this field group. Return option VALUES exactly and preserve contradictions.`}]
      const response=await client.messages.create({model:modelFor('extraction'),max_tokens:5000,system:'You are one pass in APOLLO multipass PDF ingestion. Extract every requested value explicitly supported by the PDFs. Never fabricate or silently omit a supported requested field. Cite the source ID, preserve contradictions, return option VALUES exactly, and do not calculate in this pass.',tools:[{name:'extract_evidence',description:'Return every supported candidate for the requested PDF field group.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:passContent}]})
      completeExtractionPass(trace)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,passFields,sourceIds))
    }
    const found=new Set(facts.map(fact=>fact.key));const missing=requiredFields.filter(field=>!found.has(field.key))
    if(missing.length){
      planExtractionPass(trace)
      const properties=evidenceToolProperties(missing,sourceIds,'PDF')
      const recoveryContent=[...content,{type:'text' as const,text:`REQUIRED-FIELD RECOVERY PASS:\n${missing.map(field=>fieldDescriptor(field)).join('\n')}\nSearch headings, tables, timelines, conclusions, and recommendations. Leave absent only when unsupported.`}]
      const response=await client.messages.create({model:modelFor('extraction'),max_tokens:5000,system:'Recover every explicitly supported required field missed by earlier PDF passes. Never fabricate. Return option VALUES exactly, cite source IDs, and preserve contradictions.',tools:[{name:'extract_evidence',description:'Recover supported required fields missed by prior PDF extraction.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:recoveryContent}]})
      completeExtractionPass(trace,true)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,missing,sourceIds))
    }
  }
  const deduplicated=deduplicateEvidenceFacts(facts)
  return reconcileEvidenceSupersessions(deduplicateEvidenceFacts([...deduplicated,...deriveEvidenceFacts(deduplicated,moduleSlug)]))
}

export async function extractEvidenceFactsFromImages(
  sources:Array<{id:string;name:string;mime:'image/png'|'image/jpeg';bytes:Buffer}>,
  moduleSlug:string|null,
  trace?:EvidenceExtractionTrace,
):Promise<MissionFact[]> {
  if(!sources.length||!moduleSlug||!process.env.ANTHROPIC_API_KEY)return []
  const documentModule=getModule(moduleSlug);if(!documentModule)return []
  const requiredFields=documentModule.required_fields as EvidenceField[];const optionalFields=documentModule.optional_fields as EvidenceField[]
  const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});const facts:MissionFact[]=[]
  for(const batch of batchEvidenceSources(sources,4)){
    const sourceIds=batch.map(source=>source.id)
    const content:ContentBlockParam[]=batch.flatMap(source=>[
      {type:'text' as const,text:`SOURCE ID: ${source.id} — ${source.name}`},
      {type:'image' as const,source:{type:'base64' as const,media_type:source.mime,data:source.bytes.toString('base64')}},
    ])
    for(const passFields of [...batchEvidenceSources(requiredFields,5),optionalFields]){
      if(!passFields.length)continue
      planExtractionPass(trace)
      const properties=evidenceToolProperties(passFields,sourceIds,'source')
      const response=await client.messages.create({model:modelFor('extraction'),max_tokens:5000,system:'You are one pass in APOLLO multipass image-evidence ingestion. Read visible printed and handwritten content carefully. Extract every requested value explicitly supported by the labeled images. Never infer obscured, cropped, illegible, or absent values. Cite the source ID, preserve contradictions, return option VALUES exactly, and do not calculate in this pass.',tools:[{name:'extract_evidence',description:'Return every supported candidate visible in the image evidence.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:[...content,{type:'text' as const,text:`REQUESTED FIELD PASS:\n${passFields.map(field=>fieldDescriptor(field)).join('\n')}`}]}]})
      completeExtractionPass(trace)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,passFields,sourceIds))
    }
    const found=new Set(facts.map(fact=>fact.key));const missing=requiredFields.filter(field=>!found.has(field.key))
    if(missing.length){
      planExtractionPass(trace)
      const properties=evidenceToolProperties(missing,sourceIds,'source')
      const response=await client.messages.create({model:modelFor('extraction'),max_tokens:5000,system:'This is APOLLO image required-field recovery. Reinspect every labeled image, including headers, footers, tables, form boxes, captions, and handwritten notes. Return only legible, directly supported values with source IDs. Never fabricate.',tools:[{name:'extract_evidence',description:'Recover supported required fields missed by prior image passes.',input_schema:{type:'object',properties}}],tool_choice:{type:'tool',name:'extract_evidence'},messages:[{role:'user',content:[...content,{type:'text' as const,text:`MISSING REQUIRED FIELDS:\n${missing.map(field=>fieldDescriptor(field)).join('\n')}`}]}]})
      completeExtractionPass(trace,true)
      const block=response.content.find(item=>item.type==='tool_use'&&item.name==='extract_evidence')
      if(block?.type==='tool_use')facts.push(...evidenceFactsFromToolInput(block.input as Record<string,unknown>,missing,sourceIds))
    }
  }
  const supported=moduleSlug==='quote'?filterSemanticallyUnsupportedEvidenceFacts(facts,sources.map(source=>({id:source.id,text:''})),moduleSlug):facts
  const deduplicated=deduplicateEvidenceFacts(supported)
  return reconcileEvidenceSupersessions(deduplicateEvidenceFacts([...deduplicated,...deriveEvidenceFacts(deduplicated,moduleSlug)]))
}
