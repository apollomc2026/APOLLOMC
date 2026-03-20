'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md w-full px-8 py-10 bg-gray-900 rounded-2xl border border-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-gray-400">
              We sent a magic link to <span className="text-white font-medium">{email}</span>.
              Click the link to sign in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full px-8 py-10 bg-gray-900 rounded-2xl border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Apollo MC</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-red-400 hover:text-red-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
