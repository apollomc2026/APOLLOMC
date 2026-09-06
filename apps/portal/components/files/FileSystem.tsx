'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, FileText, Search, ShieldCheck } from 'lucide-react'

type Evidence = { id:string; conversation_id:string; mission:string; name:string; mime_type:string|null; size_bytes:number|null; status:string; fact_count:number; created_at:string; download_url:string|null }
const formatBytes = (value:number|null) => !value ? '—' : value < 1048576 ? `${Math.ceil(value / 1024)} KB` : `${(value / 1048576).toFixed(1)} MB`

export default function FileSystem() {
  const [items, setItems] = useState<Evidence[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/mission-control/evidence', { credentials:'include' })
      .then(async response => { if (!response.ok) throw new Error((await response.json()).error || 'Evidence could not be loaded'); return response.json() })
      .then(body => setItems(body.evidence ?? []))
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Evidence could not be loaded'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => items.filter(item => (status === 'all' || item.status === status) && `${item.name} ${item.mission}`.toLowerCase().includes(query.toLowerCase())), [items, query, status])

  return <section className="vault" aria-busy={loading}>
    <div className="vault-toolbar">
      <label className="vault-search"><Search aria-hidden="true"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search evidence or mission" aria-label="Search evidence" /></label>
      <div className="vault-filters" aria-label="Evidence filters">{['all','verified','processing','failed'].map(value => <button type="button" key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{value}</button>)}</div>
    </div>
    {error && <div className="vault-state error"><ShieldCheck/><h2>Vault connection interrupted</h2><p>{error}</p><button type="button" onClick={() => location.reload()}>Retry connection</button></div>}
    {!error && loading && <div className="vault-state"><div className="vault-loader"/><p>Verifying evidence custody…</p></div>}
    {!error && !loading && filtered.length === 0 && <div className="vault-state"><FileText/><h2>No matching evidence</h2><p>Evidence attached in Mission Control will appear here with its custody status.</p></div>}
    {!error && !loading && filtered.length > 0 && <div className="vault-grid">{filtered.map(item => <article className="vault-card" key={item.id}>
      <div className="vault-card-icon"><FileText/></div><div className="vault-card-body"><div className="vault-card-top"><span className={`vault-status ${item.status}`}><CheckCircle2/>{item.status}</span><span>{formatBytes(item.size_bytes)}</span></div><h2>{item.name}</h2><p>{item.mission}</p><footer><span>{item.fact_count} verified facts</span><time>{new Date(item.created_at).toLocaleDateString()}</time>{item.download_url ? <a href={item.download_url} target="_blank" rel="noreferrer"><Download/> Download</a> : <span>Custody active</span>}</footer></div>
    </article>)}</div>}
  </section>
}
