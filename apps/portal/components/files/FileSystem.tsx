'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Mission, DeliverableType } from '@/lib/types/database'
import { FileText, Download, Clock, Filter } from 'lucide-react'

interface MissionWithDeliverable extends Mission {
  deliverable_types: DeliverableType | null
}

export default function FileSystem() {
  const [missions, setMissions] = useState<MissionWithDeliverable[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('missions')
        .select('*, deliverable_types(*)')
        .eq('user_id', user.id)
        .in('status', ['delivered', 'paid', 'review', 'awaiting_payment'])
        .order('created_at', { ascending: false })

      setMissions((data || []) as MissionWithDeliverable[])
      setLoading(false)
    }
    load()
  }, [])

  async function handleRedownload(missionId: string) {
    setDownloading(missionId)
    try {
      const res = await fetch(`/api/stripe/checkout?mission=${missionId}&redownload=true`)
      if (res.ok) {
        const data = await res.json()
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank')
        }
      }
    } finally {
      setDownloading(null)
    }
  }

  const filtered = filter === 'all'
    ? missions
    : missions.filter((m) => m.status === filter)

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-900 rounded-xl" />
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        {['all', 'delivered', 'review', 'awaiting_payment'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-red-600/10 text-red-400'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300">No files yet</h3>
          <p className="text-gray-500 mt-1">Completed missions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mission) => (
            <div
              key={mission.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {mission.deliverable_types?.label || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(mission.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={
                        mission.status === 'delivered'
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }
                    >
                      {mission.status.replace(/_/g, ' ')}
                    </span>
                    {mission.paid_price_cents && (
                      <span>${(mission.paid_price_cents / 100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                {mission.status === 'delivered' && (
                  <button
                    onClick={() => handleRedownload(mission.id)}
                    disabled={downloading === mission.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {downloading === mission.id ? 'Preparing...' : 'Re-download'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
