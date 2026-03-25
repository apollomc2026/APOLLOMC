'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function SettingsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon">⚙️</div>
          <div className="coming-soon-title">Settings</div>
          <div className="coming-soon-desc">
            Account preferences, API keys, notification settings, and team management.
            Configuration panel launching soon.
          </div>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
