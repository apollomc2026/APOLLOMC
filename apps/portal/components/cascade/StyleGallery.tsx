'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StyleTemplate } from '@/lib/types/database'
import { Check, Paintbrush } from 'lucide-react'

export default function StyleGallery() {
  const [styles, setStyles] = useState<StyleTemplate[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('mission')
  const deliverableId = searchParams.get('deliverable')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!deliverableId) return
      const { data } = await supabase
        .from('style_templates')
        .select('*')
        .eq('deliverable_type_id', deliverableId)
        .eq('active', true)
        .order('slug')
      setStyles(data || [])
      setLoading(false)
    }
    load()
  }, [deliverableId])

  async function confirmStyle() {
    if (!missionId || !selected) return

    const style = styles.find((s) => s.id === selected)
    if (!style) return

    await supabase
      .from('missions')
      .update({
        style_template_id: style.id,
        style_template_version: style.version,
        status: 'intake',
      })
      .eq('id', missionId)

    router.push(`/new-mission/intake?mission=${missionId}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-56 bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((style) => {
          const isSelected = selected === style.id
          return (
            <button
              key={style.id}
              onClick={() => setSelected(style.id)}
              className={`
                text-left rounded-xl p-5 transition-all border-2
                ${isSelected
                  ? 'bg-[var(--apollo-blue-subtle)] border-[var(--apollo-blue)]'
                  : 'bg-[var(--apollo-navy)] border-[var(--apollo-border)] hover:border-[var(--apollo-border-bright)]'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <Paintbrush className={`w-6 h-6 ${isSelected ? 'text-[var(--apollo-blue)]' : 'text-[var(--apollo-text-faint)]'}`} />
                {isSelected && <Check className="w-5 h-5 text-[var(--apollo-blue)]" />}
              </div>
              <h3 className="text-lg font-semibold mb-1">{style.label}</h3>
              {style.description && (
                <p className="text-sm text-[var(--apollo-text-muted)]">{style.description}</p>
              )}
              {style.preview_s3_key && (
                <div className="mt-3 h-24 bg-[var(--apollo-surface)] rounded-lg flex items-center justify-center text-[var(--apollo-text-faint)] text-xs">
                  Preview
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={confirmStyle}
            className="px-6 py-3 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] text-white font-semibold rounded-lg transition-all glow-blue"
          >
            Confirm Style
          </button>
        </div>
      )}
    </div>
  )
}
