import LaunchPad from '@/components/launch-pad/LaunchPad'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function IntakePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Launch Pad</h1>
        <p className="text-gray-400 mt-1">Tell us about your project. All required fields must be completed.</p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-900 rounded-xl" />}>
        <LaunchPad />
      </Suspense>
    </div>
  )
}
