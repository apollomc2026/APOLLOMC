'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, FileUp, Palette, Plus, ShieldCheck } from 'lucide-react'

type BrandKit = { id:string; name:string; source:string; primary_color?:string|null; secondary_color?:string|null; accent_color?:string|null; heading_font?:string|null; body_font?:string|null; voice?:string|null; source_file_name?:string|null; is_default?:boolean; created_at:string }

export function BrandKitManager() {
  const [mode, setMode] = useState<'create'|'upload'>('create')
  const [kits, setKits] = useState<BrandKit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetch('/api/mission-control/brand-kits').then(async r => { if (!r.ok) throw new Error((await r.json()).error); return r.json() }).then(b => setKits(b.brand_kits ?? [])).catch(e => setMessage(e.message || 'Brand kits could not be loaded')).finally(() => setLoading(false)) }, [])

  async function create(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('')
    const formElement = event.currentTarget; const form = new FormData(formElement); const body = Object.fromEntries(form)
    try { const response = await fetch('/api/mission-control/brand-kits', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setKits(current => [result.brand_kit, ...current]); setMessage('Brand kit created and ready for mission use.'); formElement.reset() } catch (e) { setMessage(e instanceof Error ? e.message : 'Brand kit could not be created') } finally { setSaving(false) }
  }

  async function upload(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('')
    const formElement = event.currentTarget; const form = new FormData(formElement)
    try { const response = await fetch('/api/mission-control/brand-kits', { method:'POST', body:form }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setKits(current => [result.brand_kit, ...current]); setMessage('Existing brand kit secured in Apollo custody.'); formElement.reset() } catch (e) { setMessage(e instanceof Error ? e.message : 'Brand kit could not be uploaded') } finally { setSaving(false) }
  }

  return <div className="brand-layout">
    <section className="brand-builder">
      <div className="brand-mode"><button type="button" className={mode === 'create' ? 'active':''} onClick={() => setMode('create')}><Plus/> Create new</button><button type="button" className={mode === 'upload' ? 'active':''} onClick={() => setMode('upload')}><FileUp/> Upload existing</button></div>
      {mode === 'create' ? <form className="brand-form" onSubmit={create}>
        <label>Brand kit name<input required minLength={2} name="name" placeholder="e.g. On Spot Solutions" /></label>
        <div className="brand-color-row"><label>Primary<input name="primary_color" type="color" defaultValue="#07131d" /></label><label>Secondary<input name="secondary_color" type="color" defaultValue="#143448" /></label><label>Accent<input name="accent_color" type="color" defaultValue="#5ee7ff" /></label></div>
        <div className="brand-fields"><label>Heading typeface<input name="heading_font" placeholder="Syne" /></label><label>Body typeface<input name="body_font" placeholder="Inter" /></label></div>
        <label>Voice and tone<textarea name="voice" placeholder="Precise, calm, credible, evidence-led…" /></label>
        <button className="brand-submit" disabled={saving}><Palette/>{saving ? 'Securing kit…':'Create brand kit'}</button>
      </form> : <form className="brand-form brand-upload" onSubmit={upload}>
        <label>Brand kit name<input required minLength={2} name="name" placeholder="Name this kit" /></label>
        <label className="brand-drop"><FileUp/><strong>Upload your existing brand guide</strong><span>PDF, DOCX, PNG, or JPG · 20 MB maximum</span><input required name="file" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" /></label>
        <button className="brand-submit" disabled={saving}><ShieldCheck/>{saving ? 'Securing kit…':'Import brand kit'}</button>
      </form>}
      {message && <p className="brand-message" role="status">{message}</p>}
    </section>
    <section className="brand-library"><header><span>CONFIGURED KITS</span><b>{kits.length}</b></header>{loading ? <p>Loading brand custody…</p> : kits.length === 0 ? <div className="brand-empty"><Palette/><p>No brand kits configured yet.</p></div> : kits.map(kit => <article className="brand-kit" key={kit.id}>
      <div className="brand-swatches">{[kit.primary_color,kit.secondary_color,kit.accent_color].filter(Boolean).map(color => <i key={color} style={{background:color!}}/>)}{kit.source === 'uploaded' && <FileUp/>}</div><div><h2>{kit.name}</h2><p>{kit.source === 'uploaded' ? kit.source_file_name : [kit.heading_font,kit.body_font].filter(Boolean).join(' · ') || 'Custom system'}</p></div>{kit.is_default && <span><Check/> Default</span>}
    </article>)}</section>
  </div>
}
