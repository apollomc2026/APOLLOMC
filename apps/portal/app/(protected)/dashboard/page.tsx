import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { MissionLedger } from '@/components/operations/MissionLedger'

export default async function DashboardPage({ searchParams }:{ searchParams:Promise<{ mission?:string }> }) {
  const { mission } = await searchParams
  // Preserve old mission bookmarks while keeping the command overview free of
  // mission authoring controls.
  if (mission) redirect(`/new-mission?mission=${encodeURIComponent(mission)}`)
  return <div className="app-shell"><Sidebar/><main className="main-content vault-page"><header className="page-heading"><span>APOLLO MISSION CONTROL · PORTFOLIO</span><h1>Command overview</h1><p>See mission health, delivery readiness, and the work that needs your attention. Build missions in New Mission and control completed flights from Telemetry.</p></header><MissionLedger view="dashboard"/></main></div>
}
