import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function AuthShell({ eyebrow, title, description, children, footer }: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-stage">
      <Link href="/" className="auth-wordmark" aria-label="APOLLO home">
        <Image src="/apollo-logo.png" alt="APOLLO" width={180} height={76} priority />
        <span>Mission Control</span>
      </Link>
      <section className="auth-story" aria-label="APOLLO introduction">
        <div className="auth-orbit" aria-hidden="true"><i /><i /><i /></div>
        <div className="auth-story-copy">
          <span className="lux-kicker">APOLLO / Mission systems</span>
          <h1>Turn intent into<br />finished work.</h1>
          <p>Evidence-aware intelligence for documents that have to survive the real world.</p>
        </div>
        <footer><span>03</span><p>Content first. Operational clarity second. Craft in every final page.</p></footer>
      </section>
      <section className="auth-entry">
        <div className="auth-card">
          <header><span className="lux-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p></header>
          {children}
          <div className="auth-card-footer">{footer}</div>
        </div>
        <p className="auth-legal">Secure access · APOLLO Mission Control</p>
      </section>
    </main>
  )
}
