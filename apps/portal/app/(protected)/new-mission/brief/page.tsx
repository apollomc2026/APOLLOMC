import MissionBrief from '@/components/launch-pad/MissionBrief'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function BriefPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mission Brief</h1>
        <p className="text-gray-400 mt-1">Review your mission details before launch. No build starts until you approve.</p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-900 rounded-xl" />}>
        <MissionBrief />
      </Suspense>
    </div>
  )
}
