import IndustryGrid from '@/components/cascade/IndustryGrid'

export const dynamic = 'force-dynamic'

export default function IndustryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Mission</h1>
        <p className="text-gray-400 mt-1">Step 1: Select your industry</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          <span className="text-sm font-medium">Industry</span>
        </div>
        <div className="h-px flex-1 bg-gray-800" />
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-gray-800 text-gray-500 text-sm font-bold flex items-center justify-center">2</span>
          <span className="text-sm text-gray-500">Deliverable</span>
        </div>
        <div className="h-px flex-1 bg-gray-800" />
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-gray-800 text-gray-500 text-sm font-bold flex items-center justify-center">3</span>
          <span className="text-sm text-gray-500">Style</span>
        </div>
      </div>

      <IndustryGrid />
    </div>
  )
}
