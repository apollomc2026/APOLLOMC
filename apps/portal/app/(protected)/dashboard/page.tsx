import { MissionControl } from '@/components/mission-control/MissionControl'
import { Sidebar } from '@/components/Sidebar'

export default function DashboardPage() {
  return <div className="app-shell"><Sidebar/><main className="main-content"><MissionControl/></main></div>
}
