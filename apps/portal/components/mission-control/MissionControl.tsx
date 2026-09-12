'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Check, FilePlus2, Orbit, Paperclip, ShieldCheck, Sparkles } from 'lucide-react'
import type { ConversationTurn, DeliverableSpecification, MissionTurnResult } from '@/lib/mission-control/contracts'
import { VoiceControl } from './VoiceControl'

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
  const [acceptUnresolved, setAcceptUnresolved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const restoreConversation = useCallback(async (id: string) => {
    const response = await fetch(`/api/mission-control/conversation?id=${encodeURIComponent(id)}`)
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: string } | null
      throw new Error(body?.error ?? 'The durable mission record could not be restored.')
    }
    const restored = await response.json() as { turns: ConversationTurn[]; specification: DeliverableSpecification; readiness: number; specification_version: number; job?: { id: string; state: string; artifact_url: string | null } | null }
    setConversationId(id); setTurns(restored.turns.length ? restored.turns : [opening]); setSpecification(restored.specification); setReadiness(restored.readiness); setSpecificationVersion(restored.specification_version)
    setJobId(restored.job?.id ?? null); setJobState(restored.job?.state ?? null); setArtifactUrl(restored.job?.artifact_url ?? null)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedMission = new URLSearchParams(window.location.search).get('mission')
      const saved = window.localStorage.getItem(STORAGE_KEY)
      let cached: { turns: ConversationTurn[]; specification: DeliverableSpecification | null; readiness: number; conversationId?: string | null; specificationVersion?: number; jobId?: string | null; jobState?: string | null; artifactUrl?: string | null } | null = null
      if (saved) {
        try { cached = JSON.parse(saved) } catch { window.localStorage.removeItem(STORAGE_KEY) }
      }
      const applyCached = () => {
        if (!cached) return
        setTurns(cached.turns.length ? cached.turns : [opening]); setSpecification(cached.specification); setReadiness(cached.readiness); setConversationId(cached.conversationId ?? null); setSpecificationVersion(cached.specificationVersion ?? 0); setJobId(cached.jobId ?? null); setJobState(cached.jobState ?? null); setArtifactUrl(cached.artifactUrl ?? null)
      }
      if (requestedMission) {
        void restoreConversation(requestedMission).catch(cause => {
          applyCached()
          setError(cause instanceof Error ? `${cause.message} ${cached ? 'Your locally cached mission remains available.' : ''}`.trim() : 'The durable mission record could not be restored.')
        }).finally(() => setHydrated(true))
        return
      }
      applyCached()
      if (cached?.conversationId) {
        void restoreConversation(cached.conversationId).catch(() => setError('APOLLO could not refresh the durable record. The locally cached mission remains available.')).finally(() => setHydrated(true))
      } else setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [restoreConversation])

  useEffect(() => {
    if (!hydrated || !conversationId) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('mission') === conversationId) return
    url.searchParams.set('mission', conversationId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [hydrated, conversationId])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ turns, specification, readiness, conversationId, specificationVersion, jobId, jobState, artifactUrl }))
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [hydrated, turns, specification, readiness, conversationId, specificationVersion, jobId, jobState, artifactUrl])

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
  const audience = specification?.audience.primary.join(', ') || 'Not yet confirmed'
  const formats = specification?.artifact.required_formats.join(', ').toUpperCase() || 'Not yet confirmed'
  const aura = useMemo(() => specification ? Object.entries(specification.aura).filter(([, value]) => typeof value === 'number') as Array<[string, number]> : [], [specification])
  const driveConnectHref = `/api/integrations/google-drive?action=connect&returnTo=${encodeURIComponent(conversationId ? `/dashboard?mission=${conversationId}` : '/dashboard')}`

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
      setSpecification(result.specification); setReadiness(result.readiness); setConversationId(result.conversation_id ?? conversationId); setSpecificationVersion(result.specification_version ?? specificationVersion + 1); setAcceptUnresolved(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue the mission.'); setDraft(message) } finally { setWorking(false) }
  }

  function acceptVoiceTranscript(text: string) {
    setDraft(current => [current.trim(), text].filter(Boolean).join(' '))
  }

  function resetMission() {
    setTurns([opening]); setSpecification(null); setReadiness(0); setConversationId(null); setSpecificationVersion(0); setJobId(null); setJobState(null); setArtifactUrl(null); setDraft(''); setAcceptUnresolved(false); setError(null); window.localStorage.removeItem(STORAGE_KEY); window.history.replaceState(window.history.state, '', '/dashboard')
  }

  async function attachEvidence(files: FileList | null) {
    if (!files?.length) return
    if (!conversationId || !specification) { setError('Describe the mission first, then attach evidence to its durable record.'); return }
    setWorking(true); setError(null)
    const additions: Array<{ id: string; name: string; status: 'pending' | 'verified' | 'conflict' | 'failed' }> = []
    const rejected: string[] = []
    let finalSpecification = specification
    let finalVersion = specificationVersion
    let finalReadiness = readiness
    try {
      for (const file of [...files]) {
        try {
        const form = new FormData(); form.set('conversation_id', conversationId); form.set('file', file)
        const response = await fetch('/api/mission-control/evidence', { method: 'POST', body: form })
        const uploaded = await response.json() as { id?: string; name?: string; status?: 'pending' | 'verified' | 'conflict' | 'failed'; facts?: DeliverableSpecification['content']['facts']; specification?: DeliverableSpecification; specification_version?: number; readiness?: number; error?: string }
        if (!response.ok || !uploaded.id || !uploaded.name || !uploaded.status) throw new Error(uploaded.error ?? 'upload rejected')
        additions.push({ id: uploaded.id, name: uploaded.name, status: uploaded.status })
        if (uploaded.specification) finalSpecification = uploaded.specification
        if (uploaded.specification_version) finalVersion = uploaded.specification_version
        if (typeof uploaded.readiness === 'number') finalReadiness = uploaded.readiness
        } catch (cause) { rejected.push(`${file.name}: ${cause instanceof Error ? cause.message : 'upload rejected'}`) }
      }
      if (additions.length) { setSpecification(finalSpecification); setSpecificationVersion(finalVersion); setReadiness(finalReadiness) }
      const nonExecutable = additions.filter(item => item.status !== 'verified')
      const summary = [`${additions.length} evidence file${additions.length === 1 ? '' : 's'} secured in the durable record.`]
      if (nonExecutable.length) summary.push(`${nonExecutable.length} require resolution before execution.`)
      if (rejected.length) summary.push(`${rejected.length} rejected: ${rejected.join('; ')}.`)
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: summary.join(' '), createdAt: new Date().toISOString() }])
      if (rejected.length) setError('Some files were rejected. Secured evidence and specification progress were preserved.')
    } finally { setWorking(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function approveBrief() {
    const alreadyApproved = specification?.approval.status === 'approved'
    if (!specification || readiness < 75 || (!alreadyApproved && questions.length > 0 && !acceptUnresolved)) return
    setWorking(true); setError(null)
    try {
      if (conversationId) {
        const acceptedItems = alreadyApproved ? specification.approval.unresolved_items_accepted ?? [] : acceptUnresolved ? questions : []
        const response = await fetch('/api/mission-control/approve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conversation_id: conversationId, version: specificationVersion, unresolved_items_accepted: acceptedItems }) })
        const result = await response.json() as { execution?: { state?: string; missing?: Array<{ label?: string } | string>; job_id?: string }; error?: string }
        if (!response.ok) throw new Error(result.error ?? 'The mission brief could not be locked. Refresh and try again.')
        if (result.execution?.state === 'blocked') {
          const gaps = (result.execution.missing ?? []).map(item => typeof item === 'string' ? item : item.label).filter(Boolean)
          setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: `Brief locked. Execution is paused without inventing missing inputs: ${gaps.join(', ')}. Resolve the listed dependency, then use Start approved execution to retry the same immutable brief.`, createdAt: new Date().toISOString() }])
        } else {
          setJobId(result.execution?.job_id ?? null); setJobState(result.execution?.state ?? 'queued')
          setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: `Mission brief approved and submitted to controlled execution${result.execution?.job_id ? ` as job ${result.execution.job_id}` : ''}.`, createdAt: new Date().toISOString() }])
        }
      } else {
        setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: 'Preview brief approved. Sign in to persist and execute this mission.', createdAt: new Date().toISOString() }])
      }
      setSpecification({ ...specification, approval: { ...specification.approval, status: 'approved', approved_by: specification.approval.approved_by ?? 'current-user', approved_at: specification.approval.approved_at ?? new Date().toISOString(), unresolved_items_accepted: alreadyApproved ? specification.approval.unresolved_items_accepted ?? [] : acceptUnresolved ? questions : [] } })
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

  async function retryExecution() {
    if (!jobId || jobState !== 'blocked' || working) return
    setWorking(true); setError(null)
    try {
      const response = await fetch('/api/mission-control/retry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ job_id: jobId }) })
      const result = await response.json() as { job_id?: string; state?: string; error?: string }
      if (!response.ok || !result.job_id) throw new Error(result.error ?? 'Execution retry could not be started.')
      setJobId(result.job_id); setJobState(result.state ?? 'queued'); setArtifactUrl(null)
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: 'The resolved dependency was accepted. APOLLO started a new controlled execution job and preserved the blocked run for audit.', createdAt: new Date().toISOString() }])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Execution retry failed.') } finally { setWorking(false) }
  }

  return <div className="mc-workspace">
    <header className="mc-header"><div><div className="mc-kicker"><Orbit size={14}/> APOLLO MISSION CONTROL <span>ONLINE</span></div><h1>What are we building?</h1><p>Begin with the outcome. APOLLO will engineer the deliverable.</p></div><button className="mc-secondary" onClick={resetMission}>New mission</button></header>
    <section className="mc-status" aria-label="Mission readiness"><div><span>Mission readiness</span><strong>{readinessLabel}</strong></div><div className="mc-progress"><i style={{ width: `${readiness}%` }}/></div><b>{readiness}%</b></section>
    <div className="mc-grid">
      <section className="mc-console" aria-label="Mission conversation">
        <div className="mc-transcript" ref={transcriptRef} aria-live="polite">
          {turns.map(turn => { const asksForResponse = turn.role === 'apollo' && questions.some(question => turn.content.includes(question)); return <article key={turn.id} className={`mc-turn ${turn.role}${asksForResponse ? ' requires-response' : ''}`}><div className="mc-turn-role">{turn.role === 'apollo' ? <><Sparkles size={13}/> MISSION CONTROL · HOUSTON</> : 'YOU'}</div>{turn.content.split('\n').map((line, index) => questions.includes(line) ? <p className="mc-response-required" key={index}><span>Response required</span>{line}</p> : <p key={index}>{line || <br/>}</p>)}{turn.reason ? <small><ShieldCheck size={13}/>{turn.reason}</small> : null}</article> })}
          {working ? <div className="mc-thinking"><i/><i/><i/> Engineering the next move</div> : null}
        </div>
        <div className={`mc-composer${questions.length ? ' response-pending' : ''}`}><div className="mc-prompt-label">{questions.length ? 'Response required · Answer Houston to continue' : 'Respond naturally—one answer can resolve several facts.'}</div><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder={questions.length ? 'Answer the highlighted clarification…' : 'Describe what must be accomplished, who it is for, and what you already have…'} rows={4}/><div className="mc-composer-tools"><div className="mc-input-tools"><input ref={fileRef} type="file" multiple hidden accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={event => void attachEvidence(event.target.files)}/><button type="button" className="mc-icon-button" onClick={() => fileRef.current?.click()} disabled={working}><Paperclip size={18}/><span>Add evidence</span></button><VoiceControl disabled={working} onTranscript={acceptVoiceTranscript}/></div><button type="button" className="mc-send" onClick={() => void submit()} disabled={working}><span>{working ? 'Interpreting' : 'Send to Mission Control'}</span><ArrowUp size={18}/></button></div>{error ? <p className="mc-error">{error}</p> : null}</div>
      </section>
      <aside className="mc-brief" aria-label="Live mission brief">
        <div className="mc-panel-heading"><div><span>Live mission brief</span><h2>{title}</h2></div><FilePlus2 size={20}/></div>
        {specification ? <><div className="mc-recommendation"><span>Recommended strategy</span><p>{specification.artifact.rationale}</p><em>{specification.specialist.playbook_id.replace(/-/g, ' ')} · v{specification.specialist.playbook_version}</em></div><div className="mc-brief-section mc-brief-overview"><h3>Mission definition</h3><dl><div><dt>Objective</dt><dd>{specification.mission.objective}</dd></div><div><dt>Desired action</dt><dd>{specification.mission.desired_decision_or_action}</dd></div><div><dt>Primary audience</dt><dd>{audience}</dd></div><div><dt>Output</dt><dd>{formats} · {specification.presentation.layout_genre.replace(/-/g, ' ')}</dd></div></dl></div>{jobId ? <div className="mc-job"><span>Document execution</span><strong>{jobState?.replace(/-/g, ' ')}</strong>{artifactUrl ? <a href={artifactUrl} target="_blank" rel="noreferrer">Open controlled draft</a> : <small>APOLLO is preserving checkpoints and custody.</small>}{jobState === 'blocked' ? <button onClick={() => void retryExecution()} disabled={working}>Retry resolved execution</button> : null}{jobState === 'delivered' ? <><textarea value={revision} onChange={event => setRevision(event.target.value)} placeholder="Tell APOLLO what to change in this draft…" rows={3}/><button onClick={() => void requestRevision()} disabled={!revision.trim() || working}>Issue revision instruction</button></> : null}</div> : null}<div className="mc-brief-section"><h3>Mission facts <b>{facts.length}</b></h3>{facts.length ? facts.map(fact => <div className={`mc-fact ${fact.verification_state === 'conflict' ? 'conflict' : ''}`} key={fact.key}><Check size={14}/><div><span>{fact.label}</span><strong>{fact.value}</strong>{fact.conflicts?.map(candidate => <em key={`${candidate.source}-${candidate.source_reference}-${candidate.value}`}>{candidate.source}: {candidate.value}</em>)}</div><small>{fact.verification_state === 'conflict' ? 'conflict' : fact.source}</small></div>) : <p className="mc-empty">Confirmed facts will appear here.</p>}</div><div className="mc-brief-section"><h3>Evidence record <b>{specification.sources.length}</b></h3>{specification.sources.length ? specification.sources.map(source => <div className="mc-source" key={source.id}><span>{source.name}</span><em>{source.status}</em></div>) : <p className="mc-empty">No evidence has been attached. APOLLO will not treat unsupported material as verified.</p>}</div><div className="mc-brief-section"><h3>Assumptions and obligations <b>{specification.content.assumptions.length + specification.content.obligations.length}</b></h3>{specification.content.assumptions.map(item => <p className="mc-question" key={`assumption-${item}`}><strong>Assumption</strong>{item}</p>)}{specification.content.obligations.map(item => <p className="mc-question" key={`obligation-${item}`}><strong>Obligation</strong>{item}</p>)}{!specification.content.assumptions.length && !specification.content.obligations.length ? <p className="mc-empty">No unresolved assumptions or obligations are recorded.</p> : null}</div><div className="mc-brief-section"><h3>Output strategy</h3><p className="mc-strategy">{specification.artifact.recommended_family} · {specification.content.sections.length} planned sections · {specification.specialist.required_checks.length} required checks</p>{specification.artifact.alternatives_considered.length ? <p className="mc-alternatives"><strong>Alternatives considered</strong>{specification.artifact.alternatives_considered.join(', ')}</p> : null}</div><div className="mc-brief-section"><h3>Open decisions <b>{questions.length}</b></h3>{questions.slice(0, 4).map(question => <p className="mc-question" key={question}>{question}</p>)}</div><div className="mc-brief-section"><h3>Aura calibration</h3>{aura.map(([key, value]) => <div className="mc-aura" key={key}><span>{key.replace(/_/g, ' ')}</span><i><b style={{ width: `${value}%` }}/></i><em>{value}</em></div>)}</div>{questions.length > 0 && specification.approval.status !== 'approved' ? <label className="mc-unresolved-acceptance"><input type="checkbox" checked={acceptUnresolved} onChange={event => setAcceptUnresolved(event.target.checked)}/><span>I reviewed these open decisions and explicitly accept them as unresolved for this draft.</span></label> : null}<button className="mc-approve" onClick={approveBrief} disabled={readiness < 75 || (specification.approval.status === 'approved' ? Boolean(jobId) : questions.length > 0 && !acceptUnresolved)}><ShieldCheck size={17}/>{specification.approval.status === 'approved' ? jobId ? `Brief approved · v${specificationVersion || 1} locked` : 'Start approved execution' : readiness >= 75 ? questions.length > 0 && !acceptUnresolved ? 'Accept open decisions to approve' : 'Review and approve brief' : `${75 - readiness}% to brief readiness`}</button></> : <div className="mc-empty-state"><Orbit size={34}/><h3>Standing by</h3><p>Your objective, audience, evidence, aura, assumptions, and recommended strategy will assemble here.</p></div>}
        {specification?.approval.status === 'approved' && (!jobId || jobState === 'blocked') ? <a className="mc-approve" href={driveConnectHref}>Connect Google Drive custody</a> : null}
      </aside>
    </div>
  </div>
}
