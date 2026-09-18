'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendSeconds,setResendSeconds]=useState(0)
  const [notice,setNotice]=useState('')
  const configured = isSupabaseConfigured()
  useEffect(()=>{
    if(resendSeconds<=0)return
    const timer=window.setInterval(()=>setResendSeconds(value=>Math.max(0,value-1)),1000)
    return()=>window.clearInterval(timer)
  },[resendSeconds])

  async function requestCode(){
    const request=await fetch('/api/auth/email-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
    const result=await request.json().catch(()=>({})) as {error?:string}
    if(!request.ok)throw new Error(result.error||'Unable to send an access code. Try again shortly.')
    setResendSeconds(60)
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!configured) {
      setError('Mission Control is awaiting hosted database configuration.')
      setLoading(false)
      return
    }
    try{await requestCode();setSent(true);setNotice('Access code transmitted.')}catch(cause){setError(cause instanceof Error?cause.message:'Unable to send an access code.')}
    setLoading(false)
  }

  async function handleResend(){
    if(resendSeconds>0||loading)return
    setLoading(true);setError('');setNotice('')
    try{await requestCode();setNotice('New access code transmitted. Use the newest email only.')}catch(cause){setError(cause instanceof Error?cause.message:'Unable to resend the access code.')}
    setLoading(false)
  }

  async function handleVerify(event:React.FormEvent){
    event.preventDefault()
    if(!/^\d{6,8}$/.test(code)){setError('Enter the access code from your email.');return}
    setLoading(true);setError('')
    try {
      const request=await fetch('/api/auth/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,token:code}),cache:'no-store'})
      const result=await request.json().catch(()=>({})) as {error?:string;redirectTo?:string}
      if(!request.ok)throw new Error(result.error||'APOLLO could not establish your session. Request a new code and try again.')
      // A full navigation guarantees middleware receives the Set-Cookie response
      // before evaluating the protected destination.
      window.location.assign(result.redirectTo||'/dashboard')
    } catch(cause) {
      setError(cause instanceof Error?cause.message:'APOLLO could not establish your session. Request a new code and try again.')
      setLoading(false)
    }
  }

  if (sent) return (
    <AuthShell eyebrow="Identity verification / 02" title="Enter access code." description="Use the one-time code sent to your email. Stay on this screen—no external sign-in is required." footer={<button type="button" className="auth-link-button" onClick={()=>{setSent(false);setCode('');setError('')}}>Use a different email</button>}>
      <form onSubmit={handleVerify} className="auth-form">
        <div className="auth-confirm"><span>Transmission destination</span><strong>{email}</strong></div>
        <label htmlFor="access-code"><span>One-time access code</span><input id="access-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" maxLength={8} required value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,8))} placeholder="00000000" autoFocus /></label>
        <div className="auth-code-actions"><span>{notice||'Use the newest APOLLO transmission.'}</span><button type="button" onClick={()=>void handleResend()} disabled={loading||resendSeconds>0}>{resendSeconds>0?`Resend in ${resendSeconds}s`:'Resend code'}</button></div>
        {error?<div className="auth-error" role="alert">{error}</div>:null}
        <button type="submit" disabled={loading||code.length<6} className="auth-submit auth-launch-submit"><Rocket aria-hidden="true"/><span>{loading?'Verifying…':'Enter Mission Control'}</span><b aria-hidden="true">IGNITE</b></button>
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
