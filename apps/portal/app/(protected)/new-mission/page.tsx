import { Sidebar } from '@/components/Sidebar'
import { MissionLaunchStudio } from '@/components/mission-control/MissionLaunchStudio'
import { MissionControl } from '@/components/mission-control/MissionControl'

export default async function NewMissionPage({ searchParams }:{ searchParams:Promise<{ mission?:string; draft?:string }> }) {
  const { mission, draft } = await searchParams
  const hasWorkspace = Boolean(mission || draft === '1')
  return <div className="app-shell"><Sidebar/><main className={`main-content ${hasWorkspace?'':'launch-studio-page'}`}>{hasWorkspace?<MissionControl/>:<MissionLaunchStudio/>}</main></div>
}
