import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="lux-home">
      <nav className="lux-nav">
        <a href="#mission" className="lux-brand"><Image src="https://apollomc.ai/assets/apollo_logo_transparent.png" alt="APOLLO" width={184} height={76} priority unoptimized /><span>Mission Control</span></a>
        <div><a href="#system">System</a><Link href="/login">Commander access</Link></div>
      </nav>
      <section className="lux-hero" id="mission">
        <div className="lux-celestial" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="lux-hero-copy">
          <span className="lux-kicker">APOLLO 3.0 / Evidence-aware intelligence</span>
          <h1>Mission-critical work.<br /><em>Beautifully resolved.</em></h1>
          <p>From unstructured intent to evidence-grounded, operationally complete deliverables—engineered with the discipline of a mission system.</p>
          <div className="lux-actions"><Link href="/signup" className="lux-primary">Begin a mission <span>↗</span></Link><Link href="/login" className="lux-secondary">Sign in</Link></div>
        </div>
        <div className="lux-scroll"><span>Scroll to explore</span><i /></div>
      </section>
      <section className="lux-proof" id="system">
        <header><span className="lux-kicker">The APOLLO standard</span><h2>Substance before spectacle.</h2></header>
        <div className="lux-principles">
          <article><b>01</b><h3>Understand</h3><p>Resolve intent, evidence, constraints, and unknowns before generation begins.</p></article>
          <article><b>02</b><h3>Engineer</h3><p>Structure the work for the decision, field task, or approval it must support.</p></article>
          <article><b>03</b><h3>Finish</h3><p>Apply brand, visual hierarchy, and rendered quality only after the content holds.</p></article>
        </div>
      </section>
      <footer className="lux-footer"><span>APOLLO Mission Control</span><p>On Spot Solutions LLC · Boston, Massachusetts</p><div><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></footer>
    </main>
  )
}
