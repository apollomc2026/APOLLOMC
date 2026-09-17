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
          <div className="auth-mission-emblem"><Image src="/icons/icon-512.png" alt="APOLLO Mission Control" width={210} height={210} priority /><span>Mission-critical automation</span></div>
          <span className="lux-kicker">APOLLO / Mission systems · Online</span>
          <h1>From mission intent<br />to finished work.</h1>
          <p>Evidence-aware command intelligence that transforms complex inputs into controlled, professional deliverables.</p>
        </div>
        <footer><span>MC</span><p>Secure command access · Evidence in custody · Mission systems standing by.</p></footer>
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
