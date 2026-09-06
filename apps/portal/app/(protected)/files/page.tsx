import FileSystem from '@/components/files/FileSystem'
import { Sidebar } from '@/components/Sidebar'

export default function FilesPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content vault-page">
        <header className="page-heading"><span>EVIDENCE CUSTODY · LIVE</span><h1>Evidence Vault</h1><p>Every source attached to a mission, preserved with extraction state and verified fact lineage.</p></header>
        <FileSystem />
      </main>
    </div>
  )
}
