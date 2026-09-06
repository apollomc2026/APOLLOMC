import { Sidebar } from '@/components/Sidebar'
import { MissionLedger } from '@/components/operations/MissionLedger'

export default function TelemetryPage() {
  return <div className="app-shell"><Sidebar/><main className="main-content vault-page"><header className="page-heading"><span>EXECUTION OBSERVABILITY · LIVE</span><h1>Telemetry</h1><p>Readiness, durable execution state, and controlled delivery health across the internal mission portfolio.</p></header><MissionLedger view="telemetry"/></main></div>
}
