import ReviewWindow from '@/components/review/ReviewWindow'
import { Sidebar } from '@/components/Sidebar'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div className="app-shell"><Sidebar/><main className="main-content"><ReviewWindow missionId={id}/></main></div>
}
