import type { Metadata, Viewport } from 'next'
import './globals.css'

// ── PWA Metadata ─────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Apollo Mission Control',
    template: '%s — Apollo MC',
  },
  description: 'Evidence-aware mission control for engineering professional deliverables from natural language.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  applicationName: 'Apollo Mission Control',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Apollo MC',
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png',   sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png',   sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'Apollo Mission Control',
    title: 'Apollo Mission Control',
    description: 'Evidence-aware mission control for professional deliverables',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#080810' },
    { media: '(prefers-color-scheme: light)', color: '#080810' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',  // PWA: safe area on notched devices
}

// ── SW Registration Script ────────────────────────────────
const swScript = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(reg) {
          console.log('[Apollo] Service worker registered:', reg.scope);
        })
        .catch(function(err) {
          console.warn('[Apollo] Service worker registration failed:', err);
        });
    });
  }
`;

const themeScript = `(function(){try{var saved=localStorage.getItem('apollo:theme');var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){document.documentElement.dataset.theme='dark'}})()`

// ── Root Layout ────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Preconnect for fonts loaded in globals.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#080810" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Prevent flash of wrong theme */}
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        {/* Ambient background (renders behind everything) */}
        <div className="apollo-bg" aria-hidden="true">
          <div className="apollo-bg-grid" />
          <div className="apollo-bg-nebula-1" />
          <div className="apollo-bg-nebula-2" />
          <div className="apollo-bg-scan" />
        </div>

        {children}

        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{ __html: swScript }}
        />
      </body>
    </html>
  )
}
