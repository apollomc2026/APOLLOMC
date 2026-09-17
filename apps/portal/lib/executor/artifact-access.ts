import { createHash } from 'node:crypto'
import type { ArtifactManifest } from './contracts'
import { verifyRenderedPdf } from './pdf-integrity'

export function controlledArtifactPath(jobId:string){
  const normalized=jobId.trim()
  if(!normalized)throw new Error('Artifact access requires a job id')
  return `/api/mission-control/artifact/${encodeURIComponent(normalized)}`
}

export function controlledArtifactUrl(jobId:string,appUrl=process.env.NEXT_PUBLIC_APP_URL){
  if(!appUrl)throw new Error('NEXT_PUBLIC_APP_URL is required for artifact access')
  return new URL(controlledArtifactPath(jobId),appUrl).toString()
}

/** Keep private Drive custody internal; every operator-facing link returns
 * through APOLLO authentication and ownership checks. */
export function projectControlledArtifacts<T extends Partial<ArtifactManifest>>(jobId:string,artifacts:T[]):T[]{
  const web_view_url=controlledArtifactPath(jobId)
  return artifacts.map(artifact=>({...artifact,web_view_url}))
}

/** Re-verify the exact custody bytes at pickup. A mutable or corrupted Drive
 * object must never be presented as the immutable APOLLO artifact. */
export function assertControlledPdfDownload(input:{bytes:Buffer;mimeType:string;contentSha256:string}){
  if(input.mimeType!=='application/pdf')throw new Error('Controlled artifact custody returned a non-PDF object')
  if(!/^[a-f0-9]{64}$/i.test(input.contentSha256))throw new Error('Controlled artifact manifest has no valid integrity digest')
  if(input.bytes.length<5||input.bytes.subarray(0,5).toString('ascii')!=='%PDF-')throw new Error('Controlled artifact custody returned invalid PDF bytes')
  const actual=createHash('sha256').update(input.bytes).digest('hex')
  if(actual!==input.contentSha256.toLowerCase())throw new Error('Controlled artifact custody failed integrity verification')
}

export function normalizedPdfTextSha256(text:string){
  return createHash('sha256').update(text.replace(/\s+/g,' ').trim()).digest('hex')
}

/** Reparse custody bytes at the moment of delivery. The byte digest protects
 * immutability; this second proof protects readable factual content and binds
 * pickup to the same normalized-text fingerprint recorded after rendering. */
export async function verifyControlledPdfDownload(input:{
  bytes:Buffer
  mimeType:string
  contentSha256:string
  factualContentSha256:string
}){
  assertControlledPdfDownload(input)
  if(!/^[a-f0-9]{64}$/i.test(input.factualContentSha256))throw new Error('Controlled artifact manifest has no valid factual-content digest')
  const verified=await verifyRenderedPdf(input.bytes)
  const actual=normalizedPdfTextSha256(verified.text)
  if(actual!==input.factualContentSha256.toLowerCase())throw new Error('Controlled artifact custody failed factual-content verification')
  return verified.integrity
}
