import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { getBillingStatus } from '@/lib/billing/config'

export default function BillingPage() {
  const billing = getBillingStatus()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="coming-soon-page">
          <div className="coming-soon-icon" aria-hidden="true">◎</div>
          <div className="coming-soon-title">Billing foundation</div>
          <div className="coming-soon-desc">
            APOLLO is operating internally. Checkout, payment collection, subscriptions,
            invoices, and payment-gated delivery are intentionally disabled while the
            complete mission-to-artifact system is proven in use.
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-3 text-left max-w-lg w-full">
            <div className="bg-[var(--apollo-surface)] rounded-lg p-4">
              <dt className="label-caps">Mode</dt>
              <dd className="mt-1 capitalize">{billing.mode}</dd>
            </div>
            <div className="bg-[var(--apollo-surface)] rounded-lg p-4">
              <dt className="label-caps">Payment provider</dt>
              <dd className="mt-1 capitalize">{billing.provider}</dd>
            </div>
            <div className="bg-[var(--apollo-surface)] rounded-lg p-4">
              <dt className="label-caps">Activation gate</dt>
              <dd className="mt-1">Internal system acceptance and explicit owner approval</dd>
            </div>
          </dl>
          <Link href="/dashboard" className="coming-soon-back">
            ← Back to Mission Control
          </Link>
        </div>
      </main>
    </div>
  )
}
