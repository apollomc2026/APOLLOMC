import AppShell from '@/components/shell/AppShell'

export const dynamic = 'force-dynamic'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
