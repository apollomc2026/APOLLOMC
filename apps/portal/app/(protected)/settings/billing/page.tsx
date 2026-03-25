'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'

export default function BillingPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon">💳</div>
          <div className="coming-soon-title">Billing</div>
          <div className="coming-soon-desc">
            Manage your subscription, view usage history, update payment methods,
            and download invoices. Billing portal coming soon.
          </div>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
