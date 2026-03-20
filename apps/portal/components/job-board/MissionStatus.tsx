'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Mission } from '@/lib/types/database'
import { CheckCircle, Loader2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const taskStatusConfig = {
  queued: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-800', label: 'Queued' },
  running: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-900/20', label: 'Building' },
  complete: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', label: 'Complete' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/20', label: 'Failed' },
  skipped: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-800', label: 'Skipped' },
}

interface Props {
  missionId: string
}

export default function MissionStatus({ missionId }: Props) {
  const [mission, setMission] = useState<Mission | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single()
      setMission(m)

      const { data: t } = await supabase
        .from('tasks')
        .select('*')
        .eq('mission_id', missionId)
        .order('section_index', { ascending: true })
      setTasks(t || [])
      setLoading(false)
    }
    load()

    // Subscribe to real-time updates on tasks
    const taskChannel = supabase
      .channel(`tasks-${missionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `mission_id=eq.${missionId}`,
        },
        (payload) => {
          setTasks((prev) => {
            const updated = payload.new as Task
            const idx = prev.findIndex((t) => t.id === updated.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = updated
              return next
            }
            return [...prev, updated]
          })
        }
      )
      .subscribe()

    // Subscribe to mission status changes
    const missionChannel = supabase
      .channel(`mission-${missionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'missions',
          filter: `id=eq.${missionId}`,
        },
        (payload) => {
          setMission(payload.new as Mission)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(missionChannel)
    }
  }, [missionId])

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-900 rounded-xl" />
  }

  const completedTasks = tasks.filter((t) => t.status === 'complete').length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const isComplete = mission?.status === 'review'
  const isFailed = mission?.status === 'failed'

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isComplete
                ? 'Build Complete'
                : isFailed
                  ? 'Build Failed'
                  : 'Building...'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {completedTasks} of {totalTasks} sections complete
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isFailed ? 'bg-red-600' : isComplete ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {isComplete && (
          <Link
            href={`/review/${missionId}`}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Review your deliverable
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Task list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {tasks.map((task) => {
          const config = taskStatusConfig[task.status] || taskStatusConfig.queued
          const Icon = config.icon
          return (
            <div key={task.id} className="flex items-center gap-4 p-4">
              <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon
                  className={`w-4 h-4 ${config.color} ${
                    task.status === 'running' ? 'animate-spin' : ''
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Section {(task.section_index ?? 0) + 1}: {task.section_key?.replace(/_/g, ' ')}
                </p>
                {task.error_message && (
                  <p className="text-xs text-red-400 mt-0.5 truncate">{task.error_message}</p>
                )}
              </div>
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
