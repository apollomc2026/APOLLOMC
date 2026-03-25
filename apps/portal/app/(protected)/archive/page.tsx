'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function ArchivePage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon">🗄️</div>
          <div className="coming-soon-title">Mission Archive</div>
          <div className="coming-soon-desc">
            Browse, search, and re-download completed mission deliverables.
            Full archive with version history coming soon.
          </div>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
