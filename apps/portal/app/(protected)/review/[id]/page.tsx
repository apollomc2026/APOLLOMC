import ReviewWindow from '@/components/review/ReviewWindow'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Review Deliverable</h1>
        <p className="text-gray-400 mt-1">Review, edit sections, or rebuild before downloading.</p>
      </div>

      <ReviewWindow missionId={id} />
    </div>
  )
}
