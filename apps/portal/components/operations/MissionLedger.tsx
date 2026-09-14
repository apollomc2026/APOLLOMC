'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, Archive, CheckCircle2, ExternalLink, FileText, Gauge, Plus, RotateCcw, Search, ShieldAlert } from 'lucide-react'

type Job = { id:string; state:string; progress_percent:number; message:string; created_at?:string; artifacts:Array<{title?:string;web_view_url?:string;version?:number}> }
type Mission = { id:string; title:string; status:string; readiness:number; current_spec_version:number; updated_at:string; job:Job|null; jobs?:Job[] }
type Overview = { missions:Mission[]; metrics:{ total:number; active:number; delivered:number; failed:number; average_progress:number } }

export function MissionLedger({ view }:{ view:'archive'|'telemetry'|'dashboard' }) {
  const [data,setData] = useState<Overview|null>(null); const [error,setError] = useState(''); const [query,setQuery] = useState('')
  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const response = await fetch('/api/mission-control/overview', { cache:'no-store' })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error)
        if (active) { setData(body); setError('') }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Mission ledger could not be loaded')
      }
    }
    void refresh()
    const timer = window.setInterval(refresh, 5000)
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    return () => { active=false; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', refresh) }
  }, [])
  const missions = useMemo(() => (data?.missions ?? []).filter(m => m.title.toLowerCase().includes(query.toLowerCase())),[data,query])
  if (error) return <div className="ops-empty"><ShieldAlert/><h2>Ledger connection interrupted</h2><p>{error}</p></div>
  if (!data) return <div className="ops-empty"><Activity className="ops-pulse"/><p>Reading durable mission ledger…</p></div>
  if (view === 'dashboard') return <div className="ops-stack">
    <section className="telemetry-grid">{[['Total missions',data.metrics.total],['Active flights',data.metrics.active],['Delivered documents',data.metrics.delivered],['Mission failures',data.metrics.failed]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="ops-panel"><header><span>COMMAND PRIORITIES</span><Link href="/new-mission"><Plus/>New mission</Link></header>{missions.length ? missions.slice(0,5).map(m => <article className="archive-row" key={m.id}><div className="archive-icon">{m.job?.state==='delivered'?<CheckCircle2/>:<Gauge/>}</div><div><h2>{m.title}</h2><p>{m.job?.state?.replace(/-/g,' ') ?? `${m.readiness}% calibrated`} · updated {new Date(m.updated_at).toLocaleDateString()}</p></div><span className={`vault-status ${m.job?.state==='delivered'?'verified':''}`}>{m.job?.state ?? `${m.readiness}% ready`}</span><div className="archive-actions"><Link href={m.job?.state==='delivered'?`/telemetry?mission=${m.id}`:`/new-mission?mission=${m.id}`}>{m.job?.state==='delivered'?<><RotateCcw/>View flight controls</>:<><FileText/>Resume calibration</>}</Link></div></article>) : <div className="ops-empty"><Gauge/><h2>No mission activity yet</h2><p>Initialize a mission when you are ready to build.</p><Link href="/new-mission">Open New Mission</Link></div>}</section>
    <section className="ops-panel"><header><span>OPERATIONAL SURFACES</span><b>SEPARATED BY PURPOSE</b></header><div className="dashboard-surface-links"><Link href="/telemetry"><Gauge/><strong>Telemetry</strong><span>Monitor flights, open deliverables, and command reflight versions.</span></Link><Link href="/archive"><Archive/><strong>Archive</strong><span>Find preserved mission records and immutable deliverables.</span></Link></div></section>
  </div>
  if (view === 'telemetry') return <div className="ops-stack">
    <section className="telemetry-grid">{[['Total missions',data.metrics.total],['Active flights',data.metrics.active],['Delivered documents',data.metrics.delivered],['Average mission progress',`${data.metrics.average_progress}%`]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="ops-panel"><header><span>EXECUTION CHANNELS</span><b>LIVE FLIGHT LEDGER</b></header>{missions.length ? missions.map(m => { const flights=m.jobs?.length ? m.jobs : m.job ? [m.job] : []; return <article className="telemetry-mission" key={m.id}><header className="telemetry-mission-header"><div><h2>{m.title}</h2><p>Specification v{m.current_spec_version} · {m.status.replace(/_/g,' ')}</p></div><Link href={`/telemetry?mission=${m.id}`}><RotateCcw/>Flight controls</Link></header>{flights.length ? flights.map((job,index) => { const flightNumber=flights.length-index; const flightLabel=flightNumber===1?'Launch 01':`Reflight ${String(flightNumber-1).padStart(2,'0')}`; return <div className="telemetry-flight" key={job.id}><div><span className="telemetry-flight-label">{flightLabel}</span><small>{job.created_at ? new Date(job.created_at).toLocaleString() : 'Execution record'}</small></div><div className="telemetry-progress"><i><b style={{width:`${job.progress_percent}%`}}/></i><span>{job.state}</span></div><div className="telemetry-actions">{job.state==='delivered'&&job.artifacts?.[0]?.web_view_url?<a href={job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/>Open {flightLabel}</a>:null}</div></div> }) : <div className="telemetry-flight"><div><span className="telemetry-flight-label">Preflight</span><small>Awaiting launch authorization</small></div><div className="telemetry-progress"><i><b style={{width:`${m.readiness}%`}}/></i><span>{m.readiness}% ready</span></div></div>}</article> }) : <div className="ops-empty"><Gauge/><p>No mission telemetry yet.</p></div>}</section>
  </div>
  return <div className="ops-stack"><label className="vault-search"><Search/><input aria-label="Search mission archive" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the mission archive" /></label><section className="ops-panel"><header><span>MISSION LEDGER</span><b>{missions.length} RECORDS</b></header>{missions.length ? missions.map(m => <article className="archive-row" key={m.id}><div className="archive-icon">{m.job?.state==='delivered'?<CheckCircle2/>:<FileText/>}</div><div><h2>{m.title}</h2><p>{m.status.replace(/_/g,' ')} · brief v{m.current_spec_version} · {new Date(m.updated_at).toLocaleDateString()}</p></div><span className={`vault-status ${m.job?.state==='delivered'?'verified':''}`}>{m.job?.state ?? `${m.readiness}% ready`}</span><div className="archive-actions">{m.job?.artifacts?.[0]?.web_view_url ? <a href={m.job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/> Open draft</a> : null}<Link href={m.job?.state==='delivered'?`/telemetry?mission=${m.id}`:`/new-mission?mission=${m.id}`}>{m.job?.state==='delivered'?<><RotateCcw/> Flight controls</>:<><Archive/> Resume mission</>}</Link></div></article>) : <div className="ops-empty"><Archive/><h2>No archived missions</h2><p>Mission versions and controlled drafts will appear here automatically.</p></div>}</section></div>
}
