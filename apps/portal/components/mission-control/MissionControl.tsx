'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Check, FilePlus2, Orbit, Paperclip, ShieldCheck, Sparkles } from 'lucide-react'
import type { ConversationTurn, DeliverableSpecification, MissionTurnResult } from '@/lib/mission-control/contracts'

const STORAGE_KEY = 'apollo:mission-control:v1'
const opening: ConversationTurn = { id: 'opening', role: 'apollo', content: 'Tell me what you need to accomplish. Speak naturally, type, or add the files you already have. I will identify the right deliverable, surface consequential gaps, and prepare the mission brief.', createdAt: '' }

export function MissionControl() {
  const [turns, setTurns] = useState<ConversationTurn[]>([opening])
  const [specification, setSpecification] = useState<DeliverableSpecification | null>(null)
  const [draft, setDraft] = useState('')
  const [readiness, setReadiness] = useState(0)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [specificationVersion, setSpecificationVersion] = useState(0)
  const [working, setWorking] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobState, setJobState] = useState<string | null>(null)
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null)
  const [revision, setRevision] = useState('')
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const state = JSON.parse(saved) as { turns: ConversationTurn[]; specification: DeliverableSpecification | null; readiness: number; conversationId?: string | null; specificationVersion?: number; jobId?: string | null; jobState?: string | null; artifactUrl?: string | null }
      setTurns(state.turns.length ? state.turns : [opening]); setSpecification(state.specification); setReadiness(state.readiness); setConversationId(state.conversationId ?? null); setSpecificationVersion(state.specificationVersion ?? 0); setJobId(state.jobId ?? null); setJobState(state.jobState ?? null); setArtifactUrl(state.artifactUrl ?? null)
      if (state.conversationId) void restoreConversation(state.conversationId)
    } catch { window.localStorage.removeItem(STORAGE_KEY) }
  }, [])

  async function restoreConversation(id: string) {
    const response = await fetch(`/api/mission-control/conversation?id=${encodeURIComponent(id)}`)
    if (!response.ok) return
    const restored = await response.json() as { turns: ConversationTurn[]; specification: DeliverableSpecification; readiness: number; specification_version: number; job?: { id: string; state: string; artifact_url: string | null } | null }
    setTurns(restored.turns.length ? restored.turns : [opening]); setSpecification(restored.specification); setReadiness(restored.readiness); setSpecificationVersion(restored.specification_version)
    if (restored.job) { setJobId(restored.job.id); setJobState(restored.job.state); setArtifactUrl(restored.job.artifact_url) }
  }

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ turns, specification, readiness, conversationId, specificationVersion, jobId, jobState, artifactUrl }))
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, specification, readiness, conversationId, specificationVersion, jobId, jobState, artifactUrl])

  useEffect(() => {
    if (!jobId || ['delivered', 'failed', 'blocked', 'cancelled'].includes(jobState ?? '')) return
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/mission-control/job?id=${encodeURIComponent(jobId)}`)
      if (!response.ok) return
      const result = await response.json() as { state?: string; artifacts?: Array<{ web_view_url?: string }> }
      setJobState(result.state ?? null); setArtifactUrl(result.artifacts?.[0]?.web_view_url ?? null)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [jobId, jobState])

  const readinessLabel = readiness >= 75 ? 'Brief ready' : readiness >= 50 ? 'Calibrating' : readiness ? 'Discovery' : 'Awaiting intent'
  const facts = specification?.content.facts ?? []
  const questions = specification?.content.open_questions ?? []
  const title = specification?.artifact.recommended_type.replace(/-/g, ' ') ?? 'Mission strategy pending'
  const aura = useMemo(() => specification ? Object.entries(specification.aura).filter(([, value]) => typeof value === 'number') as Array<[string, number]> : [], [specification])

  async function submit() {
    const message = draft.trim()
    if (!message || working) return
    setWorking(true); setError(null); setDraft('')
    setTurns(current => [...current, { id: crypto.randomUUID(), role: 'user', content: message, createdAt: new Date().toISOString() }])
    try {
      const response = await fetch('/api/mission-control/interpret', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, specification, conversation_id: conversationId }) })
      if (!response.ok) throw new Error(response.status === 401 ? 'Your session has expired. Sign in again to continue.' : 'Mission interpretation is temporarily unavailable.')
      const result = await response.json() as MissionTurnResult
      const content = [result.acknowledgement, result.question].filter(Boolean).join('\n\n')
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content, reason: result.question_reason, createdAt: new Date().toISOString() }])
      setSpecification(result.specification); setReadiness(result.readiness); setConversationId(result.conversation_id ?? conversationId); setSpecificationVersion(result.specification_version ?? specificationVersion + 1)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue the mission.'); setDraft(message) } finally { setWorking(false) }
  }

  function resetMission() {
    setTurns([opening]); setSpecification(null); setReadiness(0); setConversationId(null); setSpecificationVersion(0); setJobId(null); setJobState(null); setArtifactUrl(null); setDraft(''); setError(null); window.localStorage.removeItem(STORAGE_KEY)
  }

  async function attachEvidence(files: FileList | null) {
    if (!files?.length) return
    if (!conversationId || !specification) { setError('Describe the mission first, then attach evidence to its durable record.'); return }
    setWorking(true); setError(null)
    try {
      const additions: Array<{ id: string; name: string; status: 'pending' | 'verified' | 'failed' }> = []
      for (const file of [...files]) {
        const form = new FormData(); form.set('conversation_id', conversationId); form.set('file', file)
        const response = await fetch('/api/mission-control/evidence', { method: 'POST', body: form })
        if (!response.ok) throw new Error(`Unable to secure ${file.name} in the evidence record.`)
        const uploaded = await response.json() as { id: string; name: string; status: 'pending' | 'verified' | 'failed'; facts?: DeliverableSpecification['content']['facts']; specification?: DeliverableSpecification; specification_version?: number; readiness?: number }
        additions.push(uploaded)
        if (uploaded.specification) setSpecification(uploaded.specification)
        if (uploaded.specification_version) setSpecificationVersion(uploaded.specification_version)
        if (typeof uploaded.readiness === 'number') setReadiness(uploaded.readiness)
      }
      setSpecification(current => current ? { ...current, sources: [...current.sources, ...additions] } : current)
      const failures = additions.filter(item => item.status === 'failed')
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: failures.length ? `${additions.length - failures.length} evidence files verified; ${failures.length} could not be safely extracted and will not enter execution.` : `${additions.length} evidence file${additions.length === 1 ? '' : 's'} secured, integrity-checked, and ready for source-grounded execution.`, createdAt: new Date().toISOString() }])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Evidence upload failed.') } finally { setWorking(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function approveBrief() {
    if (!specification || readiness < 75) return
    setWorking(true); setError(null)
    try {
      if (conversationId) {
        const response = await fetch('/api/mission-control/approve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conversation_id: conversationId, version: specificationVersion }) })
        const result = await response.json() as { execution?: { state?: string; missing?: Array<{ label?: string } | string>; job_id?: string }; error?: string }
        if (!response.ok) throw new Error(result.error ?? 'The mission brief could not be locked. Refresh and try again.')
        if (result.execution?.state === 'blocked') {
          const gaps = (result.execution.missing ?? []).map(item => typeof item === 'string' ? item : item.label).filter(Boolean)
          setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: `Brief locked. Execution is paused without inventing missing inputs: ${gaps.join(', ')}. Add those details naturally and APOLLO will issue the next specification version.`, createdAt: new Date().toISOString() }])
        } else {
          setJobId(result.execution?.job_id ?? null); setJobState(result.execution?.state ?? 'queued')
          setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: `Mission brief approved and submitted to controlled execution${result.execution?.job_id ? ` as job ${result.execution.job_id}` : ''}.`, createdAt: new Date().toISOString() }])
        }
      } else {
        setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: 'Preview brief approved. Sign in to persist and execute this mission.', createdAt: new Date().toISOString() }])
      }
      setSpecification({ ...specification, approval: { status: 'approved', approved_by: 'current-user', approved_at: new Date().toISOString() } })
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Specification approval failed.') } finally { setWorking(false) }
  }

  async function requestRevision() {
    if (!jobId || !revision.trim() || working) return
    setWorking(true); setError(null)
    try {
      const response = await fetch('/api/mission-control/revise', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ job_id: jobId, instruction: revision }) })
      const result = await response.json() as { job_id?: string; state?: string; error?: string }
      if (!response.ok || !result.job_id) throw new Error(result.error ?? 'Revision could not be started.')
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'user', content: revision, createdAt: new Date().toISOString() }, { id: crypto.randomUUID(), role: 'apollo', content: 'Revision instruction accepted. I am rebuilding a new controlled draft while preserving the prior version.', createdAt: new Date().toISOString() }])
      setJobId(result.job_id); setJobState(result.state ?? 'queued'); setArtifactUrl(null); setRevision('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Revision failed.') } finally { setWorking(false) }
  }

  return <div className="mc-workspace">
    <header className="mc-header"><div><div className="mc-kicker"><Orbit size={14}/> APOLLO MISSION CONTROL <span>ONLINE</span></div><h1>What are we building?</h1><p>Begin with the outcome. APOLLO will engineer the deliverable.</p></div><button className="mc-secondary" onClick={resetMission}>New mission</button></header>
    <section className="mc-status" aria-label="Mission readiness"><div><span>Mission readiness</span><strong>{readinessLabel}</strong></div><div className="mc-progress"><i style={{ width: `${readiness}%` }}/></div><b>{readiness}%</b></section>
    <div className="mc-grid">
      <section className="mc-console" aria-label="Mission conversation">
        <div className="mc-transcript" ref={transcriptRef} aria-live="polite">
          {turns.map(turn => <article key={turn.id} className={`mc-turn ${turn.role}`}><div className="mc-turn-role">{turn.role === 'apollo' ? <><Sparkles size={13}/> APOLLO</> : 'YOU'}</div>{turn.content.split('\n').map((line, index) => <p key={index}>{line || <br/>}</p>)}{turn.reason ? <small><ShieldCheck size={13}/>{turn.reason}</small> : null}</article>)}
          {working ? <div className="mc-thinking"><i/><i/><i/> Engineering the next move</div> : null}
        </div>
        <div className="mc-composer"><div className="mc-prompt-label">Respond naturally—one answer can resolve several facts.</div><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder="Describe what must be accomplished, who it is for, and what you already have…" rows={4}/><div className="mc-composer-tools"><input ref={fileRef} type="file" multiple hidden accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={event => void attachEvidence(event.target.files)}/><button type="button" className="mc-icon-button" onClick={() => fileRef.current?.click()} disabled={working}><Paperclip size={18}/><span>Add evidence</span></button><button type="button" className="mc-send" onClick={() => void submit()} disabled={working}><span>{working ? 'Interpreting' : 'Send to APOLLO'}</span><ArrowUp size={18}/></button></div>{error ? <p className="mc-error">{error}</p> : null}</div>
      </section>
      <aside className="mc-brief" aria-label="Live mission brief">
        <div className="mc-panel-heading"><div><span>Live mission brief</span><h2>{title}</h2></div><FilePlus2 size={20}/></div>
        {specification ? <><div className="mc-recommendation"><span>Recommended strategy</span><p>{specification.artifact.rationale}</p><em>{specification.specialist.playbook_id.replace(/-/g, ' ')} · v{specification.specialist.playbook_version}</em></div>{jobId ? <div className="mc-job"><span>Document execution</span><strong>{jobState?.replace(/-/g, ' ')}</strong>{artifactUrl ? <a href={artifactUrl} target="_blank" rel="noreferrer">Open controlled draft</a> : <small>APOLLO is preserving checkpoints and custody.</small>}{jobState === 'delivered' ? <><textarea value={revision} onChange={event => setRevision(event.target.value)} placeholder="Tell APOLLO what to change in this draft…" rows={3}/><button onClick={() => void requestRevision()} disabled={!revision.trim() || working}>Issue revision instruction</button></> : null}</div> : null}<div className="mc-brief-section"><h3>Mission facts <b>{facts.length}</b></h3>{facts.length ? facts.map(fact => <div className="mc-fact" key={fact.key}><Check size={14}/><div><span>{fact.label}</span><strong>{fact.value}</strong></div><small>{fact.source}</small></div>) : <p className="mc-empty">Confirmed facts will appear here.</p>}</div><div className="mc-brief-section"><h3>Open decisions <b>{questions.length}</b></h3>{questions.slice(0, 4).map(question => <p className="mc-question" key={question}>{question}</p>)}</div><div className="mc-brief-section"><h3>Aura calibration</h3>{aura.map(([key, value]) => <div className="mc-aura" key={key}><span>{key.replace(/_/g, ' ')}</span><i><b style={{ width: `${value}%` }}/></i><em>{value}</em></div>)}</div><button className="mc-approve" onClick={approveBrief} disabled={readiness < 75 || specification.approval.status === 'approved'}><ShieldCheck size={17}/>{specification.approval.status === 'approved' ? `Brief approved · v${specificationVersion || 1} locked` : readiness >= 75 ? 'Review and approve brief' : `${75 - readiness}% to brief readiness`}</button></> : <div className="mc-empty-state"><Orbit size={34}/><h3>Standing by</h3><p>Your objective, audience, evidence, aura, assumptions, and recommended strategy will assemble here.</p></div>}
      </aside>
    </div>
  </div>
}
