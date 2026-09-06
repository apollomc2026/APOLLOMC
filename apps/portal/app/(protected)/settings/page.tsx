import { Sidebar } from '@/components/Sidebar'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export default function SettingsPage() {
  return <div className="app-shell"><Sidebar/><main className="main-content vault-page"><header className="page-heading"><span>CONTROL PLANE · INTERNAL</span><h1>Settings</h1><p>Set workspace behavior and inspect the safety boundaries governing this internal release.</p></header><SettingsPanel/></main></div>
}
