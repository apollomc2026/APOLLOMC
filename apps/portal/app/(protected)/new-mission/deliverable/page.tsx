import DeliverableList from '@/components/cascade/DeliverableList'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function DeliverablePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Mission</h1>
        <p className="text-gray-400 mt-1">Step 2: Choose your deliverable</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">&#10003;</span>
          <span className="text-sm font-medium text-green-400">Industry</span>
        </div>
        <div className="h-px flex-1 bg-gray-800" />
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          <span className="text-sm font-medium">Deliverable</span>
        </div>
        <div className="h-px flex-1 bg-gray-800" />
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-gray-800 text-gray-500 text-sm font-bold flex items-center justify-center">3</span>
          <span className="text-sm text-gray-500">Style</span>
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse h-48 bg-gray-900 rounded-xl" />}>
        <DeliverableList />
      </Suspense>
    </div>
  )
}
