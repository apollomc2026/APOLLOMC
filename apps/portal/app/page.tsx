import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown, ArrowRight, Crosshair, FileCheck2, Orbit, Radar, ShieldCheck, Sparkles } from 'lucide-react'

const missionSequence = [
  ['01', 'Evidence lock', 'Source material enters custody and is read before questions begin.'],
  ['02', 'Mission calibration', 'Intent, audience, standards, and unknowns resolve into one executable brief.'],
  ['03', 'Document engineering', 'Content, calculations, structure, and brand are assembled under control.'],
  ['04', 'Quality deployment', 'The finished work is verified, rendered, versioned, and ready to act on.'],
]

const capabilityCards = [
  { icon: Radar, label: 'Operational intelligence', title: 'Evidence becomes signal.', copy: 'APOLLO searches across reports, records, spreadsheets, images, and field evidence before it asks the operator for anything.' },
  { icon: ShieldCheck, label: 'Controlled autonomy', title: 'You set the authority.', copy: 'Stay involved at every checkpoint or hand APOLLO the controls. Critical assumptions remain visible, traceable, and reviewable.' },
  { icon: FileCheck2, label: 'Deployment quality', title: 'Finished means finished.', copy: 'Mission-ready deliverables arrive with document identity, version history, brand custody, and a clear path to refight.' },
]

export default function HomePage() {
  return (
    <main className="mc-home">
      <nav className="mc-nav" aria-label="Primary navigation">
        <a href="#top" className="mc-brand" aria-label="APOLLO Mission Control home">
          <Image src="/apollo-logo.png" alt="APOLLO" width={184} height={76} priority />
          <span><b>APOLLO 3.0</b><small>Mission Control</small></span>
        </a>
        <div className="mc-nav-status"><i /> System online <span>MC–03</span></div>
        <div className="mc-nav-links"><a href="#system">System</a><a href="#standard">Standard</a><Link href="/login" className="mc-nav-access">Commander access <ArrowRight /></Link></div>
      </nav>

      <section className="mc-hero" id="top">
        <div className="mc-hero-field" aria-hidden="true"><div className="mc-orbit"><i /><i /><i /></div><div className="mc-horizon" /></div>
        <div className="mc-hero-ghost" aria-hidden="true">APOLLO</div>
        <div className="mc-hero-copy">
          <div className="mc-eyebrow"><Crosshair /> Evidence-aware mission engineering <span>Built for consequential work</span></div>
          <h1>Command<br />the <em>outcome.</em></h1>
          <p>APOLLO transforms scattered intent and real-world evidence into decision-ready deliverables—with the discipline, visibility, and finish of a mission system.</p>
          <div className="mc-actions">
            <Link href="/signup" className="mc-launch"><span><Orbit /> Initialize mission</span><b>Launch sequence <ArrowRight /></b></Link>
            <Link href="/login" className="mc-signin">Return to Mission Control</Link>
          </div>
        </div>
        <aside className="mc-flight-card" aria-label="APOLLO mission sequence">
          <header><span>Mission sequence</span><b>04 STAGES</b></header>
          <div className="mc-sequence">
            {missionSequence.map(([number, title, copy], index) => <article key={number}>
              <span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div><i className={index === 3 ? 'ready' : ''} />
            </article>)}
          </div>
          <footer><span><i /> Architecture ready</span><b>Awaiting intent</b></footer>
        </aside>
        <a className="mc-descent" href="#system"><span>Descend into the system</span><ArrowDown /></a>
      </section>

      <section className="mc-signal-strip" aria-label="System qualities">
        <span>Evidence first</span><i /><span>Human-governed autonomy</span><i /><span>Brand custody</span><i /><span>Traceable decisions</span><i /><span>Controlled refights</span>
      </section>

      <section className="mc-system" id="system">
        <header className="mc-section-head">
          <span>01 / The system</span>
          <div><h2>From raw signal to<br /><em>command-ready work.</em></h2><p>Not another blank prompt. Not another generic document. APOLLO is the controlled environment between what you know and what the mission demands.</p></div>
        </header>
        <div className="mc-capabilities">
          {capabilityCards.map(({ icon: Icon, label, title, copy }, index) => <article key={label}>
            <header><Icon /><span>0{index + 1}</span></header><small>{label}</small><h3>{title}</h3><p>{copy}</p><div className="mc-card-line" />
          </article>)}
        </div>
      </section>

      <section className="mc-standard" id="standard">
        <div className="mc-standard-orbit" aria-hidden="true"><span>APOLLO</span><i /><i /></div>
        <div className="mc-standard-copy">
          <span>02 / The APOLLO standard</span>
          <h2>Substance earns<br />the spectacle.</h2>
          <p>Every mission begins with comprehension. Decoration comes only after the content can withstand scrutiny.</p>
          <ol>
            <li><b>Understand completely.</b><span>Read deeply, establish evidence hierarchy, and isolate what is truly unknown.</span></li>
            <li><b>Engineer deliberately.</b><span>Shape the work around the decision, field action, or approval it must support.</span></li>
            <li><b>Finish without compromise.</b><span>Apply hierarchy, brand, rendering, and quality control worthy of the work.</span></li>
          </ol>
        </div>
      </section>

      <section className="mc-final">
        <div className="mc-final-mark"><Sparkles /><span>Mission authority</span></div>
        <div><span>APOLLO MISSION CONTROL / ONLINE</span><h2>The mission is waiting.</h2><p>Bring the outcome. Bring the evidence. APOLLO will engineer the path between them.</p></div>
        <Link href="/signup" className="mc-final-launch"><span>Begin mission</span><ArrowRight /></Link>
      </section>

      <footer className="mc-footer"><div><Image src="/apollo-logo.png" alt="APOLLO" width={92} height={38} /><span>Mission Control</span></div><p>On Spot Solutions LLC · Boston, Massachusetts</p><nav><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav></footer>
    </main>
  )
}
