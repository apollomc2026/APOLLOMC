import { Sidebar } from '@/components/Sidebar'
import { MissionLedger } from '@/components/operations/MissionLedger'
import ReviewWindow from '@/components/review/ReviewWindow'

export default async function TelemetryPage({ searchParams }:{ searchParams:Promise<{ mission?:string }> }) {
  const { mission } = await searchParams
  return <div className="app-shell"><Sidebar/><main className={`main-content ${mission?'':'vault-page'}`}>{mission?<ReviewWindow missionId={mission}/>:<><header className="page-heading"><span>EXECUTION OBSERVABILITY · LIVE</span><h1>Telemetry</h1><p>Readiness, durable execution state, version history, and reflight controls across the mission portfolio.</p></header><MissionLedger view="telemetry"/></>}</main></div>
}
