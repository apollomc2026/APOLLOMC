'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Industry } from '@/lib/types/database'
import { Scale, Briefcase, Building2, DollarSign, Rocket } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  scale: Scale,
  briefcase: Briefcase,
  building: Building2,
  dollar: DollarSign,
  rocket: Rocket,
}

export default function IndustryGrid() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      setIndustries(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function selectIndustry(industry: Industry) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: mission } = await supabase
      .from('missions')
      .insert({
        user_id: user.id,
        industry_id: industry.id,
        deliverable_type_id: '00000000-0000-0000-0000-000000000000',
        style_template_id: '00000000-0000-0000-0000-000000000000',
        style_template_version: 0,
        status: 'draft',
      })
      .select()
      .single()

    if (mission) {
      router.push(`/new-mission/deliverable?mission=${mission.id}&industry=${industry.id}`)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {industries.map((industry) => {
        const Icon = iconMap[industry.icon_key || ''] || Briefcase
        return (
          <button
            key={industry.id}
            onClick={() => selectIndustry(industry)}
            className="text-left bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 hover:bg-gray-900/80 transition-all group"
          >
            <Icon className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-1">{industry.label}</h3>
            <p className="text-sm text-gray-400">{industry.description}</p>
          </button>
        )
      })}
    </div>
  )
}
