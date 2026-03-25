'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function TelemetryPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon">📡</div>
          <div className="coming-soon-title">Telemetry</div>
          <div className="coming-soon-desc">
            Real-time mission telemetry, build progress tracking, and execution analytics.
            This module is under active development.
          </div>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
