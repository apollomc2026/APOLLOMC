'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function LaunchPadPage() {
  const searchParams = useSearchParams()
  const industry = searchParams.get('industry')
  const payloads = searchParams.get('payloads')?.split(',').filter(Boolean) || []

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>
              Launch Pad
              <span className="live-indicator">
                <span className="live-dot" />
                STAGING
              </span>
            </h1>
            <p className="page-header-subtitle">
              Complete your mission briefing and initiate execution
            </p>
          </div>
        </div>

        {industry && payloads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            <div className="stat-card" style={{ animation: 'fadeUp 0.4s var(--ease-out) both' }}>
              <div className="stat-label">Selected Sector</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginTop: 8, textTransform: 'capitalize' }}>
                {industry}
              </div>
            </div>

            <div className="section-header">
              <div className="section-title">Configured Payloads</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {payloads.length} selected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {payloads.map((id, i) => (
                <div
                  key={id}
                  className="mission-row"
                  style={{ animation: `fadeUp 0.35s var(--ease-out) ${i * 0.06}s both` }}
                >
                  <div className="mission-status-dot running" />
                  <div className="mission-name" style={{ textTransform: 'capitalize' }}>
                    {id.replace(/-/g, ' ')}
                  </div>
                  <div className="mission-meta">STAGED</div>
                </div>
              ))}
            </div>

            <div className="coming-soon-page" style={{ minHeight: '30vh' }}>
              <div className="coming-soon-icon">🚀</div>
              <div className="coming-soon-title">Briefing Module Coming Soon</div>
              <div className="coming-soon-desc">
                The mission briefing intake flow is under active development.
                You&apos;ll be able to provide context, upload documents, and launch execution from here.
              </div>
              <Link href="/dashboard" className="coming-soon-back">
                ← Back to Mission Control
              </Link>
            </div>
          </div>
        ) : (
          <div className="coming-soon-page">
            <div className="coming-soon-icon">🚀</div>
            <div className="coming-soon-title">No Mission Configured</div>
            <div className="coming-soon-desc">
              Head to Mission Control to select a sector and payloads, then launch from there.
            </div>
            <Link href="/dashboard" className="coming-soon-back">
              ← Back to Mission Control
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
