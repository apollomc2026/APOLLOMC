import type { Metadata, Viewport } from 'next'
import './globals.css'

// ── PWA Metadata ─────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Apollo Mission Control',
    template: '%s — Apollo MC',
  },
  description: 'Autonomous deliverables execution platform. Select your sector, configure your payload, and initiate mission.',
  applicationName: 'Apollo Mission Control',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Apollo MC',
    startupImage: [
      {
        url: '/splash/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png',   sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'Apollo Mission Control',
    title: 'Apollo Mission Control',
    description: 'Autonomous deliverables execution platform',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
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

// ── Root Layout ────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
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
        <meta name="color-scheme" content="dark" />
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
