import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import type { Mission, DeliverableType } from '@/lib/types/database'

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-gray-400' },
  intake: { label: 'Intake', color: 'text-blue-400' },
  brief_pending: { label: 'Brief Pending', color: 'text-yellow-400' },
  brief_approved: { label: 'Approved', color: 'text-green-400' },
  queued: { label: 'Queued', color: 'text-blue-400' },
  building: { label: 'Building', color: 'text-amber-400' },
  review: { label: 'Review', color: 'text-purple-400' },
  awaiting_payment: { label: 'Awaiting Payment', color: 'text-orange-400' },
  paid: { label: 'Paid', color: 'text-green-400' },
  delivered: { label: 'Delivered', color: 'text-green-500' },
  failed: { label: 'Failed', color: 'text-red-400' },
  archived: { label: 'Archived', color: 'text-gray-500' },
}

function getMissionLink(mission: Mission): string {
  switch (mission.status) {
    case 'draft':
    case 'intake':
      return `/new-mission/intake?mission=${mission.id}`
    case 'brief_pending':
      return `/new-mission/brief?mission=${mission.id}`
    case 'queued':
    case 'building':
      return `/mission/${mission.id}`
    case 'review':
    case 'awaiting_payment':
      return `/review/${mission.id}`
    default:
      return `/files`
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: missions } = await supabase
    .from('missions')
    .select('*, deliverable_types(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const activeMissions = missions?.filter(
    (m) => !['delivered', 'archived', 'failed'].includes(m.status)
  ) || []

  const completedCount = missions?.filter((m) => m.status === 'delivered').length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your missions</p>
        </div>
        <Link
          href="/new-mission/industry"
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Mission
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 text-sm">Active</span>
          </div>
          <p className="text-3xl font-bold mt-2">{activeMissions.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Delivered</span>
          </div>
          <p className="text-3xl font-bold mt-2">{completedCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total</span>
          </div>
          <p className="text-3xl font-bold mt-2">{missions?.length || 0}</p>
        </div>
      </div>

      {/* Mission list */}
      {missions && missions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Missions</h2>
          {missions.map((mission: any) => {
            const status = statusLabels[mission.status] || statusLabels.draft
            const deliverable = mission.deliverable_types as DeliverableType | null
            return (
              <Link
                key={mission.id}
                href={getMissionLink(mission)}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {deliverable?.label || 'Untitled Mission'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(mission.created_at).toLocaleDateString()}
                      {mission.quoted_price_cents && (
                        <span className="ml-3">
                          ${(mission.quoted_price_cents / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300">No missions yet</h3>
          <p className="text-gray-500 mt-1">Start your first mission to create a professional document.</p>
          <Link
            href="/new-mission/industry"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Mission
          </Link>
        </div>
      )}
    </div>
  )
}
