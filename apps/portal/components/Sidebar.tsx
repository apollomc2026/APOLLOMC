'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_MISSION = [
  { href: '/dashboard',  icon: '⬡', label: 'Mission Control' },
  { href: '/launch-pad', icon: '🚀', label: 'Launch Pad', badge: 'NEW' },
  { href: '/telemetry',  icon: '📡', label: 'Telemetry' },
  { href: '/archive',    icon: '🗄️',  label: 'Archive' },
]

const NAV_SYSTEM = [
  { href: '/settings/brand', icon: '🎨', label: 'Brand Config' },
  { href: '/settings/billing', icon: '💳', label: 'Billing' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
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
        <div className="sidebar-logo-icon">
          <div className="sidebar-logo-planet" />
          <div className="sidebar-logo-ring" />
        </div>
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
          className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="sidebar-nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
        </Link>
      ))}

      {/* System Nav */}
      <div className="sidebar-section-label" style={{ marginTop: 'var(--space-6)' }}>System</div>
      {NAV_SYSTEM.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="sidebar-nav-icon">{item.icon}</span>
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
