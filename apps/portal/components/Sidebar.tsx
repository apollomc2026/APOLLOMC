'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, CreditCard, FileText, Gauge, LayoutDashboard, Palette, Plus, Settings } from 'lucide-react'

const NAV_MISSION = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Mission Control' },
  { href: '/dashboard?new=1', icon: Plus, label: 'New Mission', badge: 'NEW' },
  { href: '/telemetry', icon: Gauge, label: 'Telemetry' },
  { href: '/archive', icon: Archive, label: 'Archive' },
]

const NAV_SYSTEM = [
  { href: '/files', icon: FileText, label: 'Evidence Vault' },
  { href: '/settings/brand', icon: Palette, label: 'Brand Config' },
  { href: '/settings/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  userName?: string
  userEmail?: string
  tier?: string
}

export function Sidebar({ userName = 'Commander', userEmail, tier = 'MERCURY' }: SidebarProps) {
  const pathname = usePathname()
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="sidebar-logo">
        <img
          src="https://apollomc.ai/assets/apollo_logo_transparent.png"
          alt="Apollo MC"
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
