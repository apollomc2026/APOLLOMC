'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen scanline-bg grid-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full px-8 py-10 bg-[var(--apollo-navy)] rounded-2xl border border-[var(--apollo-border)]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--apollo-blue-glow)] border border-[var(--apollo-blue)]/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--apollo-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="label-caps mb-2">Transmission Sent</p>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h1>
            <p className="text-[var(--apollo-text-muted)]">
              We sent a secure link to <span className="text-white font-medium">{email}</span>.
              Click it to complete registration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen scanline-bg grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(0,102,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <img
            src="https://apollomc.ai/assets/apollo_logo_transparent.png"
            alt="Apollo MC"
            className="h-14 w-auto mx-auto mb-4"
          />
          <p className="label-caps tracking-[0.15em] mb-1">New Commander</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Request Access</h1>
        </div>

        <div className="px-8 py-8 bg-[var(--apollo-navy)] rounded-2xl border border-[var(--apollo-border)]">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="label-caps block mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white placeholder-[var(--apollo-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent transition-all"
                placeholder="Commander Jane Smith"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="label-caps block mb-2">
                Organization
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white placeholder-[var(--apollo-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent transition-all"
                placeholder="Acme Corp (optional)"
              />
            </div>

            <div>
              <label htmlFor="email" className="label-caps block mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white placeholder-[var(--apollo-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent transition-all"
                placeholder="commander@company.com"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--apollo-danger)] text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--apollo-danger)]" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all glow-blue"
            >
              {loading ? 'Transmitting...' : 'Request Access'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[var(--apollo-text-faint)] text-sm">
          Already have access?{' '}
          <Link href="/login" className="text-[var(--apollo-blue)] hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
