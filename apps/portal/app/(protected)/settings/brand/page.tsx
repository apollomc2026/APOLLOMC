'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function BrandConfigPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon">🎨</div>
          <div className="coming-soon-title">Brand Configuration</div>
          <div className="coming-soon-desc">
            Upload your brand assets, set color palettes, define tone guidelines,
            and configure document styling for all deliverables.
          </div>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
