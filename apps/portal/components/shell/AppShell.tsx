'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  User,
  Menu,
  X,
  LogOut,
  Activity,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Missions', icon: LayoutDashboard },
  { href: '/new-mission/industry', label: 'Launch New', icon: Plus },
  { href: '/files', label: 'Files', icon: FolderOpen },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[var(--apollo-void)] text-[var(--apollo-text)]">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--apollo-navy)] border-b border-[var(--apollo-border)]">
        <div className="flex items-center gap-3">
          <img
            src="https://apollomc.ai/assets/apollo_logo_transparent.png"
            alt="Apollo MC"
            className="h-7 w-auto"
          />
          <span className="font-bold text-lg tracking-tight">Apollo MC</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[var(--apollo-text-muted)] hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-[var(--apollo-navy)] border-r border-[var(--apollo-border)]
            transform transition-transform duration-200 ease-in-out
            lg:translate-x-0 lg:static lg:inset-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-[var(--apollo-border)]">
              <img
                src="https://apollomc.ai/assets/apollo_logo_transparent.png"
                alt="Apollo MC"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl tracking-tight">Apollo MC</span>
            </div>

            {/* Status indicator */}
            <div className="px-6 py-3 border-b border-[var(--apollo-border)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--apollo-success)] status-pulse" />
                <span className="label-caps text-[var(--apollo-success)]">Systems Operational</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <p className="label-caps px-3 mb-2">Navigation</p>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-[var(--apollo-blue-subtle)] text-[var(--apollo-blue)] border border-[var(--apollo-blue)]/20'
                        : 'text-[var(--apollo-text-muted)] hover:bg-[var(--apollo-surface)] hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-[var(--apollo-border)] space-y-1">
              <p className="label-caps px-3 mb-2">Commander</p>
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--apollo-text-muted)] hover:bg-[var(--apollo-surface)] hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--apollo-text-muted)] hover:bg-[var(--apollo-surface)] hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Disconnect
              </button>
              <div className="flex items-center gap-3 px-3 pt-3 text-xs text-[var(--apollo-text-faint)]">
                <Link href="/terms" className="hover:text-[var(--apollo-text-muted)] transition-colors">Terms</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-[var(--apollo-text-muted)] transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:min-h-0 grid-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--apollo-navy)] border-t border-[var(--apollo-border)] flex">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
                ${isActive ? 'text-[var(--apollo-blue)]' : 'text-[var(--apollo-text-faint)]'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
