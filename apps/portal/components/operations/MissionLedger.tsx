'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, Archive, CheckCircle2, ExternalLink, FileText, Gauge, PencilLine, Plus, Rocket, RotateCcw, Search, ShieldAlert } from 'lucide-react'

type Job = { id:string; state:string; progress_percent:number; message:string; created_at?:string; artifacts:Array<{title?:string;web_view_url?:string;version?:number}> }
type Mission = { id:string; title:string; status:string; readiness:number; current_spec_version:number; updated_at:string; job:Job|null; jobs?:Job[] }
type Overview = { missions:Mission[]; metrics:{ total:number; active:number; delivered:number; failed:number; average_progress:number } }

export function MissionLedger({ view }:{ view:'archive'|'telemetry'|'dashboard' }) {
  const [data,setData] = useState<Overview|null>(null); const [error,setError] = useState(''); const [query,setQuery] = useState('')
  const [launchingId,setLaunchingId] = useState<string|null>(null); const [countdown,setCountdown] = useState<number|'LIFTOFF'|null>(null); const [actionError,setActionError] = useState('')
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/mission-control/overview', { cache:'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setData(body); setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Mission ledger could not be loaded') }
  },[])
  useEffect(() => {
    let active = true
    const guardedRefresh = () => { if (active) void refresh() }
    guardedRefresh()
    const timer = window.setInterval(guardedRefresh, 5000)
    const onVisible = () => { if (document.visibilityState === 'visible') guardedRefresh() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', guardedRefresh)
    return () => { active=false; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', guardedRefresh) }
  }, [refresh])
  const missions = useMemo(() => (data?.missions ?? []).filter(m => m.title.toLowerCase().includes(query.toLowerCase())),[data,query])
  // A mission may have a newer failed or active reflight while still owning a
  // successful immutable delivery. Feature the newest successful flight across
  // complete mission history so the command-deck actions never disappear.
  const commandSelection = useMemo(() => {
    const delivered = missions.flatMap(mission => (mission.jobs?.length ? mission.jobs : mission.job ? [mission.job] : [])
      .filter(job => job.state === 'delivered')
      .map(job => ({ mission, job })))
      .sort((a,b) => new Date(b.job.created_at ?? b.mission.updated_at).getTime() - new Date(a.job.created_at ?? a.mission.updated_at).getTime())[0]
    if (delivered) return delivered
    const mission = missions.find(candidate => candidate.job && !['failed','blocked','cancelled'].includes(candidate.job.state)) ?? missions[0] ?? null
    return mission ? { mission, job:mission.job } : null
  },[missions])
  async function regenerate(mission:Mission, job:Job) {
    if (launchingId || job.state !== 'delivered') return
    setLaunchingId(mission.id); setActionError('')
    try {
      for (let count=5;count>=1;count-=1) { setCountdown(count); await new Promise(resolve=>window.setTimeout(resolve,850)) }
      setCountdown('LIFTOFF'); await new Promise(resolve=>window.setTimeout(resolve,1000))
      const response = await fetch('/api/mission-control/revise',{ method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ job_id:job.id, instruction:'Regenerate this deliverable using the current approved evidence and publication standards. Preserve all verified facts and create a new immutable draft version.' }) })
      const body = await response.json()
      if (!response.ok || !body.job_id) throw new Error(body.error ?? 'Regeneration could not be launched')
      await refresh()
    } catch(cause) { setActionError(cause instanceof Error ? cause.message : 'Regeneration could not be launched') }
    finally { setCountdown(null); setLaunchingId(null) }
  }
  if (error) return <div className="ops-empty"><ShieldAlert/><h2>Ledger connection interrupted</h2><p>{error}</p></div>
  if (!data) return <div className="ops-empty"><Activity className="ops-pulse"/><p>Reading durable mission ledger…</p></div>
  if (view === 'dashboard') return <div className="ops-stack">
    {commandSelection ? <section className="dashboard-command-deck">
      <div className="dashboard-command-orbit"><Rocket/></div>
      <div className="dashboard-command-copy"><span>{commandSelection.job?.state === 'delivered' ? 'LATEST SUCCESSFUL MISSION' : 'CURRENT COMMAND'} · SPECIFICATION V{commandSelection.mission.current_spec_version}</span><h2>{commandSelection.mission.title}</h2><p>{commandSelection.job?.state === 'delivered' ? 'Your latest controlled draft is ready for action. Open it, launch a cinematic reflight, or enter the mission environment for granular control.' : commandSelection.job ? `${commandSelection.job.message} · ${commandSelection.job.progress_percent}%` : `Mission calibration is ${commandSelection.mission.readiness}% complete.`}</p><div className="dashboard-command-status"><i/><strong>{commandSelection.job?.state?.replace(/-/g,' ') ?? `${commandSelection.mission.readiness}% ready`}</strong><small>{data.metrics.active} active · updated {new Date(commandSelection.job?.created_at ?? commandSelection.mission.updated_at).toLocaleString()}</small></div></div>
      <div className="dashboard-command-actions">{commandSelection.job?.state === 'delivered' ? <button type="button" onClick={()=>void regenerate(commandSelection.mission,commandSelection.job!)} disabled={launchingId!==null}><Rocket/><strong aria-live="assertive">{launchingId===commandSelection.mission.id && countdown!==null ? countdown : 'REGENERATE DELIVERABLE'}</strong><small>5 · 4 · 3 · 2 · 1 · Liftoff</small></button> : <Link className="dashboard-primary-action" href={`/new-mission?mission=${commandSelection.mission.id}`}><Rocket/><strong>RESUME MISSION</strong><small>Return to calibration and launch control</small></Link>}<div className="dashboard-command-quick">{commandSelection.job?.artifacts?.[0]?.web_view_url ? <a href={commandSelection.job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/>Open deliverable</a> : null}<Link href={`/telemetry?mission=${commandSelection.mission.id}`}><Gauge/>Telemetry</Link><Link href={`/new-mission?mission=${commandSelection.mission.id}&edit=1`}><PencilLine/>Edit mission data</Link><Link href="/new-mission"><Plus/>New mission</Link></div></div>
      {actionError ? <p className="dashboard-command-error"><ShieldAlert/>{actionError}</p> : null}
    </section> : <section className="dashboard-command-deck empty"><div className="dashboard-command-orbit"><Rocket/></div><div className="dashboard-command-copy"><span>COMMAND DECK · STANDING BY</span><h2>Ready for a new mission.</h2><p>Begin with the outcome. APOLLO will calibrate the specialist deliverable and preserve its evidence state.</p></div><div className="dashboard-command-actions"><Link className="dashboard-primary-action" href="/new-mission"><Plus/><strong>INITIALIZE MISSION</strong><small>Open the mission engineering environment</small></Link></div></section>}
    <section className="telemetry-grid">{[['Total missions',data.metrics.total],['Active flights',data.metrics.active],['Delivered documents',data.metrics.delivered],['Mission failures',data.metrics.failed]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="ops-panel"><header><span>COMMAND PRIORITIES</span><Link href="/new-mission"><Plus/>New mission</Link></header>{missions.length ? missions.slice(0,5).map(m => <article className="archive-row" key={m.id}><div className="archive-icon">{m.job?.state==='delivered'?<CheckCircle2/>:<Gauge/>}</div><div><h2>{m.title}</h2><p>{m.job?.state?.replace(/-/g,' ') ?? `${m.readiness}% calibrated`} · updated {new Date(m.updated_at).toLocaleDateString()}</p></div><span className={`vault-status ${m.job?.state==='delivered'?'verified':''}`}>{m.job?.state ?? `${m.readiness}% ready`}</span><div className="archive-actions"><Link href={m.job?.state==='delivered'?`/telemetry?mission=${m.id}`:`/new-mission?mission=${m.id}`}>{m.job?.state==='delivered'?<><RotateCcw/>View flight controls</>:<><FileText/>Resume calibration</>}</Link></div></article>) : <div className="ops-empty"><Gauge/><h2>No mission activity yet</h2><p>Initialize a mission when you are ready to build.</p><Link href="/new-mission">Open New Mission</Link></div>}</section>
    <section className="ops-panel"><header><span>QUICK ACTIONS</span><b>ENTER MISSION ENVIRONMENTS</b></header><div className="dashboard-surface-links"><Link href="/new-mission"><Plus/><strong>New Mission</strong><span>Engineer, calibrate, approve, and launch a new deliverable.</span></Link><Link href="/telemetry"><Gauge/><strong>Telemetry</strong><span>Monitor flights, open deliverables, and command directed reflight versions.</span></Link><Link href="/archive"><Archive/><strong>Archive</strong><span>Find preserved mission records and immutable deliverables.</span></Link><Link href="/settings/brand"><FileText/><strong>Brand Config</strong><span>Manage the identity and publication assets attached to missions.</span></Link></div></section>
  </div>
  if (view === 'telemetry') return <div className="ops-stack">
    <section className="telemetry-grid">{[['Total missions',data.metrics.total],['Active flights',data.metrics.active],['Delivered documents',data.metrics.delivered],['Average mission progress',`${data.metrics.average_progress}%`]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="ops-panel"><header><span>EXECUTION CHANNELS</span><b>LIVE FLIGHT LEDGER</b></header>{missions.length ? missions.map(m => { const flights=m.jobs?.length ? m.jobs : m.job ? [m.job] : []; return <article className="telemetry-mission" key={m.id}><header className="telemetry-mission-header"><div><h2>{m.title}</h2><p>Specification v{m.current_spec_version} · {m.status.replace(/_/g,' ')}</p></div><Link href={`/telemetry?mission=${m.id}`}><RotateCcw/>Flight controls</Link></header>{flights.length ? flights.map((job,index) => { const flightNumber=flights.length-index; const flightLabel=flightNumber===1?'Launch 01':`Reflight ${String(flightNumber-1).padStart(2,'0')}`; return <div className="telemetry-flight" key={job.id}><div><span className="telemetry-flight-label">{flightLabel}</span><small>{job.created_at ? new Date(job.created_at).toLocaleString() : 'Execution record'}</small></div><div className="telemetry-progress"><i><b style={{width:`${job.progress_percent}%`}}/></i><span>{job.state}</span></div><div className="telemetry-actions">{job.state==='delivered'&&job.artifacts?.[0]?.web_view_url?<a href={job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/>Open {flightLabel}</a>:null}</div></div> }) : <div className="telemetry-flight"><div><span className="telemetry-flight-label">Preflight</span><small>Awaiting launch authorization</small></div><div className="telemetry-progress"><i><b style={{width:`${m.readiness}%`}}/></i><span>{m.readiness}% ready</span></div></div>}</article> }) : <div className="ops-empty"><Gauge/><p>No mission telemetry yet.</p></div>}</section>
  </div>
  return <div className="ops-stack"><label className="vault-search"><Search/><input aria-label="Search mission archive" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the mission archive" /></label><section className="ops-panel"><header><span>MISSION LEDGER</span><b>{missions.length} RECORDS</b></header>{missions.length ? missions.map(m => <article className="archive-row" key={m.id}><div className="archive-icon">{m.job?.state==='delivered'?<CheckCircle2/>:<FileText/>}</div><div><h2>{m.title}</h2><p>{m.status.replace(/_/g,' ')} · brief v{m.current_spec_version} · {new Date(m.updated_at).toLocaleDateString()}</p></div><span className={`vault-status ${m.job?.state==='delivered'?'verified':''}`}>{m.job?.state ?? `${m.readiness}% ready`}</span><div className="archive-actions">{m.job?.artifacts?.[0]?.web_view_url ? <a href={m.job.artifacts[0].web_view_url} target="_blank" rel="noreferrer"><ExternalLink/> Open draft</a> : null}<Link href={m.job?.state==='delivered'?`/telemetry?mission=${m.id}`:`/new-mission?mission=${m.id}`}>{m.job?.state==='delivered'?<><RotateCcw/> Flight controls</>:<><Archive/> Resume mission</>}</Link></div></article>) : <div className="ops-empty"><Archive/><h2>No archived missions</h2><p>Mission versions and controlled drafts will appear here automatically.</p></div>}</section></div>
}
