'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, Archive, CheckCircle2, ExternalLink, FileText, Gauge, RotateCcw, Search, ShieldAlert } from 'lucide-react'

type Job = { id:string; state:string; progress_percent:number; message:string; artifacts:Array<{title?:string;web_view_url?:string;version?:number}> }
type Mission = { id:string; title:string; status:string; readiness:number; current_spec_version:number; updated_at:string; job:Job|null }
type Overview = { missions:Mission[]; metrics:{ total:number; active:number; delivered:number; failed:number; average_readiness:number } }

export function MissionLedger({ view }:{ view:'archive'|'telemetry' }) {
  const [data,setData] = useState<Overview|null>(null); const [error,setError] = useState(''); const [query,setQuery] = useState('')
  useEffect(() => { fetch('/api/mission-control/overview').then(async r => { const body=await r.json(); if(!r.ok) throw new Error(body.error); return body }).then(setData).catch(e => setError(e.message || 'Mission ledger could not be loaded')) }, [])
  const missions = useMemo(() => (data?.missions ?? []).filter(m => m.title.toLowerCase().includes(query.toLowerCase())),[data,query])
  if (error) return <div className="ops-empty"><ShieldAlert/><h2>Ledger connection interrupted</h2><p>{error}</p></div>
  if (!data) return <div className="ops-empty"><Activity className="ops-pulse"/><p>Reading durable mission ledger…</p></div>
  if (view === 'telemetry') return <div className="ops-stack">
    <section className="telemetry-grid">{[['Total missions',data.metrics.total],['Active',data.metrics.active],['Delivered',data.metrics.delivered],['Average readiness',`${data.metrics.average_readiness}%`]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="ops-panel"><header><span>EXECUTION CHANNELS</span><b>LIVE LEDGER</b></header>{missions.length ? missions.map(m => <article className="telemetry-row" key={m.id}><div><h2>{m.title}</h2><p>Specification v{m.current_spec_version} · {m.status.replace(/_/g,' ')}</p></div><div className="telemetry-progress"><i><b style={{width:`${m.job?.progress_percent ?? m.readiness}%`}}/></i><span>{m.job?.state ?? `${m.readiness}% ready`}</span></div></article>) : <div className="ops-empty"><Gauge/><p>No mission telemetry yet.</p></div>}</section>
  </div>
  return <div className="ops-stack"><label className="vault-search"><Search/><input aria-label="Search mission archive" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the mission archive" /></label><section className="ops-panel"><header><span>MISSION LEDGER</span><b>{missions.length} RECORDS</b></header>{missions.length ? missions.map(m => <article className="archive-row" key={m.id}><div className="archive-icon">{m.job?.state==='delivered'?<CheckCircle2/>:<FileText/>}</div><div><h2>{m.title}</h2><p>{m.status.replace(/_/g,' ')} · brief v{m.current_spec_version} · {new Date(m.updated_at).toLocaleDateString()}</p></div><span className={`vault-status ${m.job?.state==='delivered'?'verified':''}`}>{m.job?.state ?? `${m.readiness}% ready`}</span><div className="archive-actions">{m.job?.artifacts?.[0]?.web_view_url ? <a href={m.job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/> Open draft</a> : null}<Link href={`/dashboard?mission=${m.id}`}>{m.job?.state==='delivered'?<><RotateCcw/> Review and revise</>:<><Archive/> Resume</>}</Link></div></article>) : <div className="ops-empty"><Archive/><h2>No archived missions</h2><p>Mission versions and controlled drafts will appear here automatically.</p></div>}</section></div>
}
