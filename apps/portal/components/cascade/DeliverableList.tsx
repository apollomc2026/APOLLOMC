'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DeliverableType } from '@/lib/types/database'
import { Clock, FileText, ArrowRight } from 'lucide-react'

export default function DeliverableList() {
  const [deliverables, setDeliverables] = useState<DeliverableType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('mission')
  const industryId = searchParams.get('industry')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!industryId) return
      const { data } = await supabase
        .from('deliverable_types')
        .select('*')
        .eq('industry_id', industryId)
        .eq('active', true)
        .order('sort_order')
      setDeliverables(data || [])
      setLoading(false)
    }
    load()
  }, [industryId])

  async function selectDeliverable(deliverable: DeliverableType) {
    if (!missionId) return

    await supabase
      .from('missions')
      .update({
        deliverable_type_id: deliverable.id,
        quoted_price_cents: deliverable.base_price_cents,
      })
      .eq('id', missionId)

    router.push(`/new-mission/style?mission=${missionId}&deliverable=${deliverable.id}`)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deliverables.map((d) => (
        <button
          key={d.id}
          onClick={() => selectDeliverable(d)}
          className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold group-hover:text-red-400 transition-colors">
                {d.label}
              </h3>
              {d.description && (
                <p className="text-sm text-gray-400 mt-1">{d.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {d.estimated_pages_min}–{d.estimated_pages_max} pages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~{d.estimated_minutes} min
                </span>
                <span className="font-medium text-green-400">
                  ${(d.base_price_cents / 100).toFixed(2)}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
          </div>
        </button>
      ))}
    </div>
  )
}
