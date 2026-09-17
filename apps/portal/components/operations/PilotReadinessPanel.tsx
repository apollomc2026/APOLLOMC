"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, RefreshCw, ShieldCheck } from "lucide-react";

type Gate={key:string;label:string;passed:boolean;evidence:string};
type PilotClass={deliverable_type:string;conversation_id:string|null;passed:boolean;gates:Gate[]};
type PilotReport={passed:boolean;passed_classes:number;total_classes:number;classes:PilotClass[]};

const LABELS:Record<string,string>={fsr:"Field Service Report","final-qc-report":"Final QC Report",quote:"Quote / Estimate",proposal:"Proposal","cash-flow-budget-package":"Financial Packet","contract-intelligence-review":"Contract Review"};

export function PilotReadinessPanel(){
  const [report,setReport]=useState<PilotReport|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const response=await fetch("/api/mission-control/pilot-readiness",{cache:"no-store"});
      const body=await response.json() as PilotReport&{error?:string};
      if(!response.ok)throw new Error(body.error||"Pilot audit could not be loaded.");
      setReport(body);
    }catch(cause){setError(cause instanceof Error?cause.message:"Pilot audit could not be loaded.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  return <section className="pilot-readiness-panel">
    <header><div><span>SIX-CLASS PILOT GATE</span><h2>Release readiness</h2><p>Live proof only. A class passes when its newest mission clears every controlled gate.</p></div><button type="button" onClick={()=>void load()} disabled={loading}><RefreshCw className={loading?"spin":""}/>{loading?"Auditing…":"Refresh audit"}</button></header>
    {error?<div className="pilot-audit-error"><CircleAlert/><div><strong>Audit unavailable</strong><p>{error}</p></div></div>:null}
    {report?<><div className="pilot-readiness-score"><ShieldCheck/><strong>{report.passed_classes} / {report.total_classes}</strong><span>{report.passed?"PILOT GATE PASSED":"CLASSES VERIFIED"}</span></div><div className="pilot-class-grid">{report.classes.map(item=>{
      const passed=item.gates.filter(gate=>gate.passed).length;const firstFailure=item.gates.find(gate=>!gate.passed);
      return <article className={item.passed?"passed":"pending"} key={item.deliverable_type}><div className="pilot-class-title"><span>{item.passed?<Check/>:<CircleAlert/>}</span><div><strong>{LABELS[item.deliverable_type]||item.deliverable_type}</strong><small>{passed}/{item.gates.length} gates passed</small></div></div><div className="pilot-gate-track">{item.gates.map(gate=><i className={gate.passed?"passed":""} title={`${gate.label}: ${gate.evidence}`} key={gate.key}/>)}</div>{firstFailure?<p><b>Next gate:</b> {firstFailure.label}<small>{firstFailure.evidence}</small></p>:<p><b>Verified:</b> Every pilot gate has live proof.</p>}{item.conversation_id?<Link href={`/telemetry?mission=${item.conversation_id}`}>Open representative mission</Link>:<Link href="/new-mission">Create representative mission</Link>}</article>;
    })}</div></>:loading?<div className="pilot-audit-loading">Reading mission specifications, evidence custody, job events, artifacts, recovery, and regeneration lineage…</div>:null}
  </section>;
}
