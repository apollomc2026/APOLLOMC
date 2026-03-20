'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Task, Mission, Output } from '@/lib/types/database'
import {
  Edit3,
  RefreshCw,
  Save,
  CheckCircle,
  Loader2,
  DollarSign,
  Eye,
} from 'lucide-react'

interface Props {
  missionId: string
}

export default function ReviewWindow({ missionId }: Props) {
  const [mission, setMission] = useState<Mission | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [output, setOutput] = useState<Output | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [rebuildSection, setRebuildSection] = useState<string | null>(null)
  const [rebuildFeedback, setRebuildFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
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

      const { data: o } = await supabase
        .from('outputs')
        .select('*')
        .eq('mission_id', missionId)
        .order('version', { ascending: false })
        .limit(1)
        .single()
      setOutput(o)

      if (o?.s3_key_preview) {
        const res = await fetch(`/api/delivery/preview?key=${encodeURIComponent(o.s3_key_preview)}`)
        if (res.ok) {
          const data = await res.json()
          setPreviewUrl(data.url)
        }
      }

      setLoading(false)
    }
    load()
  }, [missionId])

  async function handleSaveEdit(taskId: string) {
    setSaving(true)
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const updatedJson = {
        ...(task.output_json || {}),
        content: editContent,
      }

      await supabase
        .from('tasks')
        .update({ output_json: updatedJson })
        .eq('id', taskId)

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, output_json: updatedJson } : t
        )
      )
      setEditingSection(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleRebuild(taskId: string) {
    if (!rebuildFeedback.trim()) return
    setRebuilding(true)

    try {
      // Reset the task with feedback appended
      await supabase
        .from('tasks')
        .update({
          status: 'queued',
          error_message: null,
          output_raw: null,
          output_json: null,
          checkpoint_s3_key: null,
        })
        .eq('id', taskId)

      // Store rebuild feedback as event
      await supabase.from('events').insert({
        mission_id: missionId,
        event_type: 'section_rebuild_requested',
        event_data: {
          task_id: taskId,
          feedback: rebuildFeedback,
        },
      })

      setRebuildSection(null)
      setRebuildFeedback('')

      // Trigger the job worker
      fetch('/api/jobs', { method: 'POST' })
    } finally {
      setRebuilding(false)
    }
  }

  function proceedToPayment() {
    router.push(`/api/stripe/checkout?mission=${missionId}`)
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-900 rounded-xl" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left panel — Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          Preview
        </h3>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Document preview"
            className="w-full rounded-lg border border-gray-700"
          />
        ) : (
          <div className="aspect-[8.5/11] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
            <p className="text-center text-sm px-8">
              Preview will be available once the document is compiled.
              Review individual sections below.
            </p>
          </div>
        )}
      </div>

      {/* Right panel — Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sections</h3>
          <button
            onClick={proceedToPayment}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Looks good — download
          </button>
        </div>

        {tasks.map((task) => {
          const content =
            typeof task.output_json === 'object' && task.output_json
              ? (task.output_json as Record<string, unknown>).content as string || JSON.stringify(task.output_json)
              : ''
          const isEditing = editingSection === task.id
          const isRebuilding = rebuildSection === task.id

          return (
            <div
              key={task.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">
                  {task.section_key?.replace(/_/g, ' ')}
                </h4>
                <div className="flex items-center gap-2">
                  {task.status === 'running' && (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  {task.status === 'complete' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingSection(task.id)
                          setEditContent(content)
                          setRebuildSection(null)
                        }}
                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setRebuildSection(task.id)
                          setEditingSection(null)
                        }}
                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Rebuild
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content display */}
              {!isEditing && !isRebuilding && task.status === 'complete' && (
                <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-6">
                  {content}
                </p>
              )}

              {/* Edit mode */}
              {isEditing && (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      disabled={saving}
                      className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Rebuild mode */}
              {isRebuilding && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">
                    Describe what should change about this section:
                  </p>
                  <textarea
                    value={rebuildFeedback}
                    onChange={(e) => setRebuildFeedback(e.target.value)}
                    rows={3}
                    placeholder="e.g., Make the tone more formal, add specific metrics..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRebuild(task.id)}
                      disabled={rebuilding || !rebuildFeedback.trim()}
                      className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${rebuilding ? 'animate-spin' : ''}`} />
                      {rebuilding ? 'Rebuilding...' : 'Rebuild Section'}
                    </button>
                    <button
                      onClick={() => setRebuildSection(null)}
                      className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {task.status === 'queued' && (
                <p className="text-sm text-gray-500 italic">Waiting to build...</p>
              )}
              {task.status === 'running' && (
                <p className="text-sm text-amber-400 italic">Building this section...</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
