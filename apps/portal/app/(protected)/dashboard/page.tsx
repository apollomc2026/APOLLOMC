import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { MissionLedger } from '@/components/operations/MissionLedger'

export default async function DashboardPage({ searchParams }:{ searchParams:Promise<{ mission?:string }> }) {
  const { mission } = await searchParams
  // Preserve old mission bookmarks while keeping the command overview free of
  // mission authoring controls.
  if (mission) redirect(`/new-mission?mission=${encodeURIComponent(mission)}`)
  return <div className="app-shell"><Sidebar/><main className="main-content vault-page"><header className="page-heading dashboard-heading"><span>APOLLO MISSION CONTROL · ONLINE</span><h1>Mission Control</h1><p>Your command station for the next move, current mission health, and immediate flight actions. Enter a mission environment only when you need granular control.</p></header><MissionLedger view="dashboard"/></main></div>
}
