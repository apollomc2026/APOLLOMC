import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen scanline-bg grid-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,102,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="text-center max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="https://apollomc.ai/assets/apollo_logo_transparent.png"
            alt="Apollo MC"
            className="h-20 w-auto"
          />
        </div>

        {/* Tagline */}
        <p className="label-caps mb-4 tracking-[0.2em]">Mission Control</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Mission: Inevitable
        </h1>
        <p className="text-lg text-[var(--apollo-text-muted)] mb-10 max-w-lg mx-auto">
          Mission-grade documents. Built by AI. Delivered with the precision of a launch sequence.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] text-white font-semibold rounded-lg transition-all glow-blue"
          >
            Begin Mission
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-[var(--apollo-surface)] hover:bg-[var(--apollo-border)] text-[var(--apollo-text)] font-medium rounded-lg transition-colors border border-[var(--apollo-border)]"
          >
            Sign In
          </Link>
        </div>

        {/* Rocket */}
        <div className="mt-16 flex justify-center opacity-20">
          <img
            src="https://apollomc.ai/assets/Rocket_transparent.png"
            alt=""
            className="h-32 w-auto"
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-[var(--apollo-text-faint)] text-xs">
          <p>On Spot Solutions LLC — Boston, Massachusetts</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-[var(--apollo-text-muted)] transition-colors">Terms of Service</Link>
            <span className="text-[var(--apollo-border-bright)]">·</span>
            <Link href="/privacy" className="hover:text-[var(--apollo-text-muted)] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
