'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/AuthShell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const configured = isSupabaseConfigured()

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!configured) {
      setError('Mission Control is awaiting hosted database configuration.')
      setLoading(false)
      return
    }
    const { error: authError } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/confirm` } })
    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <AuthShell eyebrow="Transmission sent" title="Check your inbox." description="Your secure commander link is ready." footer={<Link href="/">Return home</Link>}>
      <div className="auth-confirm"><span>Transmission destination</span><strong>{email}</strong><p>Open the message and follow the secure link to enter Mission Control.</p></div>
    </AuthShell>
  )

  return (
    <AuthShell eyebrow="Secure entry / 01" title="Commander access." description="Enter your approved email. We’ll send a private, single-use access link." footer={<>New to APOLLO? <Link href="/signup">Request access</Link></>}>
      <form onSubmit={handleLogin} className="auth-form">
        <label htmlFor="email"><span>Email address</span><input id="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="commander@company.com" autoComplete="email" /></label>
        {error ? <div className="auth-error" role="alert">{error}</div> : null}
        {!configured && !error ? <div className="auth-error" role="alert">Hosted database configuration is required before commander access can open.</div> : null}
        <button type="submit" disabled={loading || !configured} className="auth-submit"><span>{loading ? 'Transmitting…' : configured ? 'Send secure link' : 'Configuration required'}</span><b aria-hidden="true">↗</b></button>
      </form>
    </AuthShell>
  )
}
