'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, FileClock, LoaderCircle, RefreshCw, Rocket, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

type Artifact = { title?:string; web_view_url?:string; version?:number; content_sha256?:string }
type Job = { id:string; state:string; progress_percent:number; message:string; artifacts:Artifact[]; revision_of:string|null; revision_instruction:string|null; missing_inputs:string[]; error_code:string|null; created_at:string; completed_at:string|null }
type ReviewRecord = { conversation_id:string; specification_version:number; specification:DeliverableSpecification; job:Job|null; jobs:Job[] }

const terminal = new Set(['delivered','failed','blocked','cancelled'])

export default function ReviewWindow({ missionId }:{ missionId:string }) {
  const [record,setRecord] = useState<ReviewRecord|null>(null)
  const [loading,setLoading] = useState(true)
  const [working,setWorking] = useState(false)
  const [error,setError] = useState('')
  const [section,setSection] = useState('Entire document')
  const [instruction,setInstruction] = useState('')
  const [countdown,setCountdown] = useState<number|'LIFTOFF'|null>(null)

  const load = useCallback(async () => {
    const response = await fetch(`/api/mission-control/conversation?id=${encodeURIComponent(missionId)}`, { cache:'no-store' })
    const body = await response.json()
    if (!response.ok) throw new Error(body.error ?? 'Review record could not be loaded')
    setRecord(body)
  },[missionId])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load().catch(cause => setError(cause instanceof Error?cause.message:'Review record could not be loaded')).finally(()=>setLoading(false)) },0)
    return () => window.clearTimeout(timer)
  },[load])
  const jobState = record?.job?.state
  useEffect(() => {
    if (!jobState || terminal.has(jobState)) return
    const timer = window.setInterval(() => void load().catch(()=>undefined),3000)
    return () => window.clearInterval(timer)
  },[jobState,load])

  const specification = record?.specification
  const latest = record?.job
  const artifact = latest?.artifacts?.[0]
  const sections = useMemo(() => ['Entire document',...(specification?.content.sections ?? [])],[specification])

  async function revise(instructionOverride?:string) {
    const requestedInstruction = instructionOverride?.trim() || instruction.trim()
    if (!latest || latest.state !== 'delivered' || !requestedInstruction || working) return
    setWorking(true); setError('')
    try {
      const scoped = section === 'Entire document' ? requestedInstruction : `Revise only the “${section}” section: ${requestedInstruction}`
      const response = await fetch('/api/mission-control/revise',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({job_id:latest.id,instruction:scoped})})
      const body = await response.json()
      if (!response.ok || !body.job_id) throw new Error(body.error ?? 'Revision could not be accepted')
      setInstruction(''); setSection('Entire document')
      await load()
    } catch(cause) { setError(cause instanceof Error?cause.message:'Revision could not be accepted') }
    finally { setWorking(false) }
  }

  async function regenerate() {
    if (countdown !== null || working || latest?.state !== 'delivered') return
    for (let count=5;count>=1;count-=1) {
      setCountdown(count)
      await new Promise(resolve=>window.setTimeout(resolve,850))
    }
    setCountdown('LIFTOFF')
    await new Promise(resolve=>window.setTimeout(resolve,1200))
    await revise('Regenerate this deliverable using the current approved evidence and publication standards. Preserve all verified facts and create a new immutable draft version.')
    setCountdown(null)
  }

  async function retry() {
    if (!latest || latest.state !== 'blocked' || working) return
    setWorking(true); setError('')
    try {
      const response = await fetch('/api/mission-control/retry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({job_id:latest.id})})
      const body = await response.json()
      if (!response.ok || !body.job_id) throw new Error(body.error ?? 'Execution retry could not be accepted')
      await load()
    } catch(cause) { setError(cause instanceof Error?cause.message:'Execution retry could not be accepted') }
    finally { setWorking(false) }
  }

  if (loading) return <div className="review-loading"><LoaderCircle/><span>Opening controlled review record…</span></div>
  if (!record || !specification) return <div className="review-empty"><TriangleAlert/><h1>Review unavailable</h1><p>{error || 'This mission record could not be found.'}</p><Link href="/archive">Return to archive</Link></div>

  return <main className="review-workbench">
    <header className="review-header"><div><Link href="/telemetry"><ArrowLeft/> Flight ledger</Link><span>TELEMETRY CONTROL · SPECIFICATION V{record.specification_version}</span><h1>{specification.mission.title || specification.artifact.recommended_family}</h1><p>{specification.mission.objective}</p></div><div className={`review-state ${latest?.state ?? 'pending'}`}><i/><span>Execution state</span><strong>{latest?.state?.replace(/-/g,' ') ?? 'not started'}</strong></div></header>
    <section className="review-grid">
      <article className="review-artifact"><div className="review-panel-title"><span>01 / CONTROLLED DRAFT</span>{artifact?.content_sha256?<small>SHA-256 · {artifact.content_sha256.slice(0,12)}…</small>:null}</div><div className="review-document"><FileClock/><h2>{artifact?.title ?? specification.artifact.recommended_type.replace(/-/g,' ')}</h2><p>{latest?.message ?? 'No document run has been started for this specification.'}</p>{latest && !terminal.has(latest.state)?<div className="review-progress"><i style={{width:`${latest.progress_percent}%`}}/><span>{latest.progress_percent}%</span></div>:null}{artifact?.web_view_url?<a href={artifact.web_view_url} target="_blank" rel="noreferrer"><ExternalLink/> Open draft in customer Drive</a>:null}{latest?.state==='blocked'?<div className="review-warning"><TriangleAlert/><span>Resolve in Settings: {latest.missing_inputs.join(', ') || latest.error_code || 'execution dependency'}</span><button onClick={()=>void retry()} disabled={working}>{working?'Starting retry':'Retry resolved execution'}</button></div>:null}</div><div className="review-boundary"><ShieldCheck/><p><strong>Draft boundary enforced.</strong> Review instructions create a new immutable job and preserve every prior artifact.</p></div></article>
      <article className="review-controls"><div className="review-panel-title"><span>02 / REFLIGHT CONTROL</span><small>{specification.content.sections.length} planned sections</small></div><div className="review-quick-reflight"><strong>Launch a clean regeneration</strong><p>Reuse the approved mission, evidence, and brand without changing its facts.</p><button onClick={()=>void regenerate()} disabled={latest?.state!=='delivered'||working||countdown!==null}><Rocket/>{countdown!==null?countdown:'REGENERATE DELIVERABLE'}</button><Link href={`/new-mission?mission=${missionId}&edit=1`}>Edit mission data instead</Link></div><label><span>Or command a specific revision</span><select aria-label="Revision target" value={section} onChange={event=>setSection(event.target.value)}>{sections.map(item=><option key={item}>{item}</option>)}</select></label><label><span>What should change on the next flight?</span><textarea aria-label="Describe the required change" value={instruction} onChange={event=>setInstruction(event.target.value)} rows={8} placeholder="Leave blank facts intact. State the change, desired outcome, or publication improvement…"/></label><button onClick={()=>void revise()} disabled={latest?.state!=='delivered'||!instruction.trim()||working}>{working?<LoaderCircle className="spin"/>:<RefreshCw/>}{working?'Initializing reflight':'INITIATE DIRECTED REFLIGHT'}</button>{latest?.state!=='delivered'?<p className="review-hint">Reflight controls unlock after the current deliverable reaches delivered status.</p>:null}{error?<p className="review-error">{error}</p>:null}</article>
    </section>
    <section className="review-history"><header><div><span>03 / VERSION LINEAGE</span><h2>Nothing overwritten.</h2></div><p>Every revision remains attributable to its source job and instruction.</p></header>{record.jobs.length?<div>{record.jobs.map((job,index)=><article key={job.id}><div className="review-version-icon">{job.state==='delivered'?<CheckCircle2/>:<FileClock/>}</div><div><span>{job.artifacts[0]?.version ? `DRAFT ${job.artifacts[0].version}` : `EXECUTION ${record.jobs.length-index}`}</span><strong>{job.revision_instruction || 'Approved specification execution'}</strong><small>{new Date(job.created_at).toLocaleString()} · {job.id.slice(0,8)}</small></div><em>{job.state.replace(/-/g,' ')}</em>{job.artifacts[0]?.web_view_url?<a href={job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/> Open</a>:null}</article>)}</div>:<div className="review-no-history">No execution versions exist yet.</div>}</section>
  </main>
}
