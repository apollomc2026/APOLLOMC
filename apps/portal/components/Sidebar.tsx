'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Archive, CreditCard, FileText, Gauge, LayoutDashboard, Palette, Plus, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV_MISSION = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Mission Control' },
  { href: '/new-mission', icon: Plus, label: 'New Mission', badge: 'NEW' },
  { href: '/telemetry', icon: Gauge, label: 'Telemetry' },
  { href: '/archive', icon: Archive, label: 'Archive' },
]

const NAV_SYSTEM = [
  { href: '/files', icon: FileText, label: 'Evidence Vault' },
  { href: '/settings/brand', icon: Palette, label: 'Brand Config' },
  { href: '/settings/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const SEEN_DELIVERIES_KEY = 'apollo:telemetry:seen-deliveries:v1'

type TelemetryNotice = { failed:number; ready:number }

interface SidebarProps {
  userName?: string
  tier?: string
}

export function Sidebar({ userName = 'Commander', tier = 'MERCURY' }: SidebarProps) {
  const pathname = usePathname()
  const [telemetryNotice, setTelemetryNotice] = useState<TelemetryNotice>({ failed:0, ready:0 })
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    let active = true
    async function refreshNotices() {
      const response = await fetch('/api/mission-control/overview', { cache:'no-store' }).catch(() => null)
      if (!response?.ok) return
      const overview = await response.json() as { missions?:Array<{ job?:{ id?:string; state?:string } | null }> }
      const missions = overview.missions ?? []
      const deliveredIds = missions.flatMap(mission => mission.job?.state === 'delivered' && mission.job.id ? [mission.job.id] : [])
      let seenIds: string[] = []
      try {
        const stored = JSON.parse(window.localStorage.getItem(SEEN_DELIVERIES_KEY) ?? '[]')
        if (Array.isArray(stored)) seenIds = stored.filter((id): id is string => typeof id === 'string')
      } catch {
        window.localStorage.removeItem(SEEN_DELIVERIES_KEY)
      }
      const seen = new Set(seenIds)
      if (pathname.startsWith('/telemetry')) {
        deliveredIds.forEach(id => seen.add(id))
        window.localStorage.setItem(SEEN_DELIVERIES_KEY, JSON.stringify([...seen]))
      }
      if (active) setTelemetryNotice({
        failed: missions.filter(mission => mission.job?.state === 'failed').length,
        ready: pathname.startsWith('/telemetry') ? 0 : deliveredIds.filter(id => !seen.has(id)).length,
      })
    }
    void refreshNotices()
    const timer = window.setInterval(refreshNotices, 15_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [pathname])

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="sidebar-logo">
        <Image
          src="/apollo-logo.png"
          alt="Apollo MC"
          width={180}
          height={76}
          priority
          className="sidebar-logo-img"
        />
        <div>
          <div className="sidebar-logo-text">APOLLO</div>
          <span className="sidebar-logo-sub">Mission Control</span>
        </div>
      </Link>

      {/* Mission Nav */}
      <div className="sidebar-section-label">Operations</div>
      {NAV_MISSION.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-nav-item ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}
        >
          <item.icon className="sidebar-nav-icon" aria-hidden="true" />
          {item.label}
          {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
          {item.href === '/telemetry' && (telemetryNotice.failed > 0 || telemetryNotice.ready > 0) ? (
            <span className="sidebar-telemetry-notices" aria-label={`${telemetryNotice.failed} failed missions, ${telemetryNotice.ready} new missions ready`}>
              {telemetryNotice.failed > 0 ? <b className="failed" title="Failed missions">{telemetryNotice.failed}</b> : null}
              {telemetryNotice.ready > 0 ? <b className="ready" title="New missions ready">{telemetryNotice.ready}</b> : null}
            </span>
          ) : null}
        </Link>
      ))}

      {/* System Nav */}
      <div className="sidebar-section-label" style={{ marginTop: 'var(--sp-6)' }}>System</div>
      {NAV_SYSTEM.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <item.icon className="sidebar-nav-icon" aria-hidden="true" />
          {item.label}
        </Link>
      ))}

      <div className="sidebar-divider" />

      <ThemeToggle />

      {/* User Card */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div>
          <div className="sidebar-user-name">{userName}</div>
          <div className="sidebar-user-tier">{tier} TIER</div>
        </div>
      </div>
    </aside>
  )
}
