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
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const state = JSON.parse(saved) as { turns: ConversationTurn[]; specification: DeliverableSpecification | null; readiness: number }
      setTurns(state.turns.length ? state.turns : [opening]); setSpecification(state.specification); setReadiness(state.readiness)
    } catch { window.localStorage.removeItem(STORAGE_KEY) }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ turns, specification, readiness }))
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, specification, readiness])

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
      const response = await fetch('/api/mission-control/interpret', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, specification }) })
      if (!response.ok) throw new Error(response.status === 401 ? 'Your session has expired. Sign in again to continue.' : 'Mission interpretation is temporarily unavailable.')
      const result = await response.json() as MissionTurnResult
      const content = [result.acknowledgement, result.question].filter(Boolean).join('\n\n')
      setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content, reason: result.question_reason, createdAt: new Date().toISOString() }])
      setSpecification(result.specification); setReadiness(result.readiness)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue the mission.'); setDraft(message) } finally { setWorking(false) }
  }

  function resetMission() {
    setTurns([opening]); setSpecification(null); setReadiness(0); setDraft(''); setError(null); window.localStorage.removeItem(STORAGE_KEY)
  }

  function attachEvidence(files: FileList | null) {
    if (!files?.length) return
    const additions = [...files].map(file => ({ id: crypto.randomUUID(), name: file.name, status: 'pending' as const }))
    setSpecification(current => current ? { ...current, sources: [...current.sources, ...additions] } : current)
    setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: `${additions.length} evidence file${additions.length === 1 ? '' : 's'} staged for extraction and fact reconciliation.`, createdAt: new Date().toISOString() }])
  }

  function approveBrief() {
    if (!specification || readiness < 75) return
    setSpecification({ ...specification, approval: { status: 'approved', approved_by: 'current-user', approved_at: new Date().toISOString() } })
    setTurns(current => [...current, { id: crypto.randomUUID(), role: 'apollo', content: 'Mission brief approved and locked as specification version 1.0. The document job is ready for controlled execution.', createdAt: new Date().toISOString() }])
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
        <div className="mc-composer"><div className="mc-prompt-label">Respond naturally—one answer can resolve several facts.</div><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder="Describe what must be accomplished, who it is for, and what you already have…" rows={4}/><div className="mc-composer-tools"><input ref={fileRef} type="file" multiple hidden accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={event => attachEvidence(event.target.files)}/><button type="button" className="mc-icon-button" onClick={() => fileRef.current?.click()}><Paperclip size={18}/><span>Add evidence</span></button><button type="button" className="mc-send" onClick={() => void submit()} disabled={!draft.trim() || working}><span>{working ? 'Interpreting' : 'Send to APOLLO'}</span><ArrowUp size={18}/></button></div>{error ? <p className="mc-error">{error}</p> : null}</div>
      </section>
      <aside className="mc-brief" aria-label="Live mission brief">
        <div className="mc-panel-heading"><div><span>Live mission brief</span><h2>{title}</h2></div><FilePlus2 size={20}/></div>
        {specification ? <><div className="mc-recommendation"><span>Recommended strategy</span><p>{specification.artifact.rationale}</p><em>{specification.specialist.playbook_id.replace(/-/g, ' ')} · v{specification.specialist.playbook_version}</em></div><div className="mc-brief-section"><h3>Mission facts <b>{facts.length}</b></h3>{facts.length ? facts.map(fact => <div className="mc-fact" key={fact.key}><Check size={14}/><div><span>{fact.label}</span><strong>{fact.value}</strong></div><small>{fact.source}</small></div>) : <p className="mc-empty">Confirmed facts will appear here.</p>}</div><div className="mc-brief-section"><h3>Open decisions <b>{questions.length}</b></h3>{questions.slice(0, 4).map(question => <p className="mc-question" key={question}>{question}</p>)}</div><div className="mc-brief-section"><h3>Aura calibration</h3>{aura.map(([key, value]) => <div className="mc-aura" key={key}><span>{key.replace(/_/g, ' ')}</span><i><b style={{ width: `${value}%` }}/></i><em>{value}</em></div>)}</div><button className="mc-approve" onClick={approveBrief} disabled={readiness < 75 || specification.approval.status === 'approved'}><ShieldCheck size={17}/>{specification.approval.status === 'approved' ? 'Brief approved · v1.0 locked' : readiness >= 75 ? 'Review and approve brief' : `${75 - readiness}% to brief readiness`}</button></> : <div className="mc-empty-state"><Orbit size={34}/><h3>Standing by</h3><p>Your objective, audience, evidence, aura, assumptions, and recommended strategy will assemble here.</p></div>}
      </aside>
    </div>
  </div>
}
