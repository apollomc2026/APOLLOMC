'use client'

import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

const protectedRoots = ['/dashboard','/new-mission','/telemetry','/archive','/files','/launch-pad','/settings']

export function GlobalThemeAccess() {
  const pathname = usePathname()
  if (protectedRoots.some(root => pathname === root || pathname.startsWith(`${root}/`))) return null
  return <div className="global-theme-access"><ThemeToggle/></div>
}
