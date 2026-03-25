import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Clock, CheckCircle, AlertCircle, FileText, Activity } from 'lucide-react'
import type { Mission, DeliverableType } from '@/lib/types/database'

const statusLabels: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Standby', color: 'text-[var(--apollo-text-muted)]', dot: 'bg-[var(--apollo-text-faint)]' },
  intake: { label: 'Intake', color: 'text-[var(--apollo-blue)]', dot: 'bg-[var(--apollo-blue)]' },
  brief_pending: { label: 'Brief Pending', color: 'text-[var(--apollo-warning)]', dot: 'bg-[var(--apollo-warning)]' },
  brief_approved: { label: 'Approved', color: 'text-[var(--apollo-success)]', dot: 'bg-[var(--apollo-success)]' },
  queued: { label: 'In Queue', color: 'text-[var(--apollo-blue)]', dot: 'bg-[var(--apollo-blue)]' },
  building: { label: 'Building', color: 'text-[var(--apollo-warning)]', dot: 'bg-[var(--apollo-warning)] status-pulse' },
  review: { label: 'Review', color: 'text-purple-400', dot: 'bg-purple-400' },
  awaiting_payment: { label: 'Awaiting Deploy', color: 'text-orange-400', dot: 'bg-orange-400' },
  paid: { label: 'Deployed', color: 'text-[var(--apollo-success)]', dot: 'bg-[var(--apollo-success)]' },
  delivered: { label: 'Delivered', color: 'text-[var(--apollo-success)]', dot: 'bg-[var(--apollo-success)]' },
  failed: { label: 'Failed', color: 'text-[var(--apollo-danger)]', dot: 'bg-[var(--apollo-danger)]' },
  archived: { label: 'Archived', color: 'text-[var(--apollo-text-faint)]', dot: 'bg-[var(--apollo-text-faint)]' },
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

  const displayName = user?.user_metadata?.full_name
    ? `Commander ${user.user_metadata.full_name.split(' ')[0]}`
    : 'Commander'

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-caps mb-1">Mission Control</p>
          <h1 className="text-2xl font-bold">{displayName}</h1>
        </div>
        <Link
          href="/new-mission/industry"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] text-white font-semibold rounded-lg transition-all glow-blue"
        >
          <Plus className="w-4 h-4" />
          Launch Mission
        </Link>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-4 h-4 text-[var(--apollo-warning)]" />
            <span className="label-caps">Active</span>
          </div>
          <p className="text-3xl font-bold">{activeMissions.length}</p>
        </div>
        <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-4 h-4 text-[var(--apollo-success)]" />
            <span className="label-caps">Delivered</span>
          </div>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-4 h-4 text-[var(--apollo-blue)]" />
            <span className="label-caps">Total Missions</span>
          </div>
          <p className="text-3xl font-bold">{missions?.length || 0}</p>
        </div>
      </div>

      {/* Mission list */}
      {missions && missions.length > 0 ? (
        <div className="space-y-3">
          <p className="label-caps mb-1">Recent Missions</p>
          {missions.map((mission: any) => {
            const status = statusLabels[mission.status] || statusLabels.draft
            const deliverable = mission.deliverable_types as DeliverableType | null
            return (
              <Link
                key={mission.id}
                href={getMissionLink(mission)}
                className="block bg-[var(--apollo-navy)] rounded-xl p-5 mission-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {deliverable?.label || 'Untitled Mission'}
                    </h3>
                    <p className="text-sm text-[var(--apollo-text-faint)] mt-1">
                      {new Date(mission.created_at).toLocaleDateString()}
                      {mission.quoted_price_cents && (
                        <span className="ml-3">
                          ${(mission.quoted_price_cents / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl">
          <div className="w-16 h-16 rounded-full bg-[var(--apollo-surface)] flex items-center justify-center mx-auto mb-4">
            <img
              src="https://apollomc.ai/assets/Rocket_transparent.png"
              alt=""
              className="h-8 w-auto opacity-40"
            />
          </div>
          <h3 className="text-lg font-medium text-[var(--apollo-text)]">No Missions Yet</h3>
          <p className="text-[var(--apollo-text-muted)] mt-1">Launch your first mission to create a professional document.</p>
          <Link
            href="/new-mission/industry"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] text-white font-semibold rounded-lg transition-all glow-blue"
          >
            <Plus className="w-4 h-4" />
            Launch Mission
          </Link>
        </div>
      )}
    </div>
  )
}
