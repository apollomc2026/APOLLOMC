import { Sidebar } from '@/components/Sidebar'
import { MissionLedger } from '@/components/operations/MissionLedger'

export default function ArchivePage() {
  return <div className="app-shell"><Sidebar/><main className="main-content vault-page"><header className="page-heading"><span>DURABLE RECORD · VERSIONED</span><h1>Mission Archive</h1><p>Resume prior missions, inspect locked brief versions, and reopen controlled deliverables.</p></header><MissionLedger view="archive"/></main></div>
}
