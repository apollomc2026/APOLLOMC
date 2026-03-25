'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Mission } from '@/lib/types/database'
import {
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Rocket,
  Layers,
} from 'lucide-react'

interface Brief {
  deliverable: { label: string; description: string }
  style: { label: string; description: string }
  sections: Array<{ key: string; label: string }>
  estimated_pages: { min: number; max: number }
  estimated_minutes: number
  files_received: Array<{ name: string; extraction_status: string }>
  inputs_summary: Record<string, string>
  price_cents: number
}

export default function MissionBrief() {
  const [mission, setMission] = useState<Mission | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('mission')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!missionId) return

      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single()

      if (data) {
        setMission(data)
        setBrief(data.mission_brief as unknown as Brief)
      }
      setLoading(false)
    }
    load()
  }, [missionId])

  async function handleApprove() {
    if (!missionId) return
    setApproving(true)

    const res = await fetch(`/api/missions/${missionId}/approve`, { method: 'POST' })
    if (res.ok) {
      router.push(`/mission/${missionId}`)
    } else {
      setApproving(false)
    }
  }

  if (loading || !brief) {
    return <div className="animate-pulse h-96 bg-[var(--apollo-navy)] rounded-xl" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-6">
        <p className="label-caps mb-2">Mission Brief</p>
        <h2 className="text-xl font-bold mb-1">{brief.deliverable.label}</h2>
        <p className="text-[var(--apollo-text-muted)]">{brief.deliverable.description}</p>
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1 text-[var(--apollo-text-muted)]">
            <FileText className="w-4 h-4" />
            {brief.estimated_pages.min}–{brief.estimated_pages.max} pages
          </span>
          <span className="flex items-center gap-1 text-[var(--apollo-text-muted)]">
            <Clock className="w-4 h-4" />
            ~{brief.estimated_minutes} min build time
          </span>
          <span className="flex items-center gap-1 text-[var(--apollo-success)] font-medium">
            <DollarSign className="w-4 h-4" />
            ${(brief.price_cents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Style */}
      <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--apollo-blue)]" />
          Style Template
        </h3>
        <p className="text-white">{brief.style.label}</p>
        {brief.style.description && (
          <p className="text-sm text-[var(--apollo-text-muted)] mt-1">{brief.style.description}</p>
        )}
      </div>

      {/* Sections */}
      <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-6">
        <h3 className="font-semibold mb-3">Sections to Build ({brief.sections.length})</h3>
        <div className="space-y-2">
          {brief.sections.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-[var(--apollo-surface)] text-[var(--apollo-text-muted)] text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      {brief.files_received.length > 0 && (
        <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-6">
          <h3 className="font-semibold mb-3">Files Received</h3>
          <div className="space-y-2">
            {brief.files_received.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {f.extraction_status === 'complete' ? (
                  <CheckCircle className="w-4 h-4 text-[var(--apollo-success)]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[var(--apollo-warning)]" />
                )}
                <span>{f.name}</span>
                <span className="text-[var(--apollo-text-faint)]">({f.extraction_status})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inputs Summary */}
      <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-6">
        <h3 className="font-semibold mb-3">Your Inputs</h3>
        <dl className="space-y-2">
          {Object.entries(brief.inputs_summary).map(([key, value]) => (
            <div key={key} className="text-sm">
              <dt className="text-[var(--apollo-text-faint)] font-medium">{key.replace(/_/g, ' ')}</dt>
              <dd className="text-white mt-0.5">{value as string}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Approve button */}
      <div className="bg-[var(--apollo-navy)] border border-[var(--apollo-blue)]/20 rounded-xl p-6">
        <p className="text-sm text-[var(--apollo-text-muted)] mb-4">
          By approving this mission, you confirm your inputs and authorize Apollo MC to build
          your deliverable. No build starts until you approve.
        </p>
        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] disabled:opacity-50 text-white font-semibold rounded-lg transition-all glow-blue"
        >
          <Rocket className="w-4 h-4" />
          {approving ? 'Launching...' : 'Approve & Launch'}
        </button>
      </div>
    </div>
  )
}
