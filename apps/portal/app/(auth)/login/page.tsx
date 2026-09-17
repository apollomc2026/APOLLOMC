'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const configured = isSupabaseConfigured()
  const router = useRouter()

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!configured) {
      setError('Mission Control is awaiting hosted database configuration.')
      setLoading(false)
      return
    }
    const request=await fetch('/api/auth/email-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
    const result=await request.json().catch(()=>({})) as {error?:string}
    if(!request.ok)setError(result.error||'Unable to send an access code. Try again shortly.')
    else setSent(true)
    setLoading(false)
  }

  async function handleVerify(event:React.FormEvent){
    event.preventDefault()
    if(!/^\d{6}$/.test(code)){setError('Enter the six-digit access code from your email.');return}
    setLoading(true);setError('')
    const { error:authError }=await createClient().auth.verifyOtp({email,token:code,type:'email'})
    if(authError)setError(authError.message)
    else{router.replace('/dashboard');router.refresh()}
    setLoading(false)
  }

  if (sent) return (
    <AuthShell eyebrow="Identity verification / 02" title="Enter access code." description="Use the six-digit code sent to your email. Stay on this screen—no external sign-in is required." footer={<button type="button" className="auth-link-button" onClick={()=>{setSent(false);setCode('');setError('')}}>Use a different email</button>}>
      <form onSubmit={handleVerify} className="auth-form">
        <div className="auth-confirm"><span>Transmission destination</span><strong>{email}</strong></div>
        <label htmlFor="access-code"><span>Six-digit access code</span><input id="access-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" autoFocus /></label>
        {error?<div className="auth-error" role="alert">{error}</div>:null}
        <button type="submit" disabled={loading||code.length!==6} className="auth-submit auth-launch-submit"><Rocket aria-hidden="true"/><span>{loading?'Verifying…':'Enter Mission Control'}</span><b aria-hidden="true">IGNITE</b></button>
      </form>
    </AuthShell>
  )

  return (
    <AuthShell eyebrow="Secure entry / 01" title="Commander access." description="Enter your approved email. We’ll send a private, single-use access code." footer={<>New to APOLLO? <Link href="/signup">Request access</Link></>}>
      <form onSubmit={handleLogin} className="auth-form">
        <label htmlFor="email"><span>Email address</span><input id="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="commander@company.com" autoComplete="email" /></label>
        {error ? <div className="auth-error" role="alert">{error}</div> : null}
        {!configured && !error ? <div className="auth-error" role="alert">Hosted database configuration is required before commander access can open.</div> : null}
        <button type="submit" disabled={loading || !configured} className="auth-submit auth-launch-submit"><Rocket aria-hidden="true"/><span>{loading ? 'Transmitting…' : configured ? 'Send access code' : 'Configuration required'}</span><b aria-hidden="true">IGNITE</b></button>
      </form>
    </AuthShell>
  )
}
