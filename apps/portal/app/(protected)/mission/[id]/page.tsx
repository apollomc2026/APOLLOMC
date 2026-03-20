import MissionStatus from '@/components/job-board/MissionStatus'

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mission Control</h1>
        <p className="text-gray-400 mt-1">Track your build progress in real time.</p>
      </div>

      <MissionStatus missionId={id} />
    </div>
  )
}
