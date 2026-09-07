'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/AuthShell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const configured = isSupabaseConfigured()

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!configured) {
      setError('Mission Control is awaiting hosted database configuration.')
      setLoading(false)
      return
    }
    const { error: authError } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/confirm`, data: { full_name: fullName, company_name: companyName } } })
    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <AuthShell eyebrow="Request received" title="Check your inbox." description="Your secure registration link is ready." footer={<Link href="/">Return home</Link>}>
      <div className="auth-confirm"><span>Transmission destination</span><strong>{email}</strong><p>Open the message and follow the secure link to complete registration.</p></div>
    </AuthShell>
  )

  return (
    <AuthShell eyebrow="New commander / 01" title="Request access." description="Create your identity for APOLLO Mission Control." footer={<>Already approved? <Link href="/login">Sign in</Link></>}>
      <form onSubmit={handleSignup} className="auth-form">
        <label htmlFor="fullName"><span>Full name</span><input id="fullName" type="text" required value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Commander Jane Smith" autoComplete="name" /></label>
        <label htmlFor="companyName"><span>Organization <em>Optional</em></span><input id="companyName" type="text" value={companyName} onChange={event => setCompanyName(event.target.value)} placeholder="Acme Corp" autoComplete="organization" /></label>
        <label htmlFor="email"><span>Email address</span><input id="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="commander@company.com" autoComplete="email" /></label>
        {error ? <div className="auth-error" role="alert">{error}</div> : null}
        {!configured && !error ? <div className="auth-error" role="alert">Hosted database configuration is required before access requests can open.</div> : null}
        <button type="submit" disabled={loading || !configured} className="auth-submit"><span>{loading ? 'Transmitting…' : configured ? 'Request access' : 'Configuration required'}</span><b aria-hidden="true">↗</b></button>
      </form>
    </AuthShell>
  )
}
