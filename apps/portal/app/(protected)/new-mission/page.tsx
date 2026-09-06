import { Sidebar } from '@/components/Sidebar'
import { MissionLaunchStudio } from '@/components/mission-control/MissionLaunchStudio'

export default function NewMissionPage() {
  return <div className="app-shell"><Sidebar/><main className="main-content launch-studio-page"><MissionLaunchStudio/></main></div>
}
