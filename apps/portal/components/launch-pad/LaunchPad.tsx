'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Mission, DeliverableType, IntakeSession } from '@/lib/types/database'
import { Upload, Check, ChevronRight, ChevronLeft, Rocket } from 'lucide-react'

interface ModuleField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'multi-select'
  options?: string[]
  placeholder?: string
}

interface FileUploadPrompt {
  kind: string
  label: string
}

interface ModuleDefinition {
  deliverable_slug: string
  required_fields: ModuleField[]
  optional_fields: ModuleField[]
  file_upload_prompts: FileUploadPrompt[]
  sections: Array<{
    key: string
    label: string
    min_words: number
    max_words: number
    instructions?: string
  }>
}

export default function LaunchPad() {
  const [mission, setMission] = useState<Mission | null>(null)
  const [deliverable, setDeliverable] = useState<DeliverableType | null>(null)
  const [module, setModule] = useState<ModuleDefinition | null>(null)
  const [collected, setCollected] = useState<Record<string, string>>({})
  const [session, setSession] = useState<IntakeSession | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; kind: string }>>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('mission')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!missionId) return

      const { data: m } = await supabase
        .from('missions')
        .select('*, deliverable_types(*)')
        .eq('id', missionId)
        .single()

      if (!m) return
      setMission(m as Mission)
      setDeliverable((m as unknown as Record<string, unknown>).deliverable_types as DeliverableType)

      const { data: existing } = await supabase
        .from('intake_sessions')
        .select('*')
        .eq('mission_id', missionId)
        .single()

      if (existing) {
        setSession(existing)
        setCollected(existing.collected as Record<string, string>)
      } else {
        const { data: newSession } = await supabase
          .from('intake_sessions')
          .insert({ mission_id: missionId })
          .select()
          .single()
        setSession(newSession)
      }

      const { data: files } = await supabase
        .from('uploaded_files')
        .select('id, original_name, kind')
        .eq('mission_id', missionId)

      setUploadedFiles(
        (files || []).map((f) => ({ id: f.id, name: f.original_name, kind: f.kind }))
      )

      const slug = (m as unknown as Record<string, Record<string, string>>).deliverable_types?.slug
      if (slug) {
        try {
          const res = await fetch(`/api/intake/module?slug=${slug}`)
          if (res.ok) {
            setModule(await res.json())
          }
        } catch {
          // Module not found
        }
      }

      setLoading(false)
    }
    load()
  }, [missionId])

  const saveField = useCallback(
    async (key: string, value: string) => {
      const updated = { ...collected, [key]: value }
      setCollected(updated)

      if (session) {
        await supabase
          .from('intake_sessions')
          .update({ collected: updated })
          .eq('id', session.id)
      }
    },
    [collected, session, supabase]
  )

  async function handleFileUpload(file: File, kind: string) {
    if (!missionId) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('kind', kind)

    const res = await fetch(`/api/missions/${missionId}/files`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setUploadedFiles((prev) => [...prev, { id: data.id, name: file.name, kind }])
    }

    setUploading(false)
  }

  async function launchMission() {
    if (!missionId || !session) return

    await supabase
      .from('intake_sessions')
      .update({ collected, complete: true })
      .eq('id', session.id)

    await fetch(`/api/missions/${missionId}/assemble`, { method: 'POST' })

    router.push(`/new-mission/brief?mission=${missionId}`)
  }

  if (loading || !module) {
    return <div className="animate-pulse h-96 bg-[var(--apollo-navy)] rounded-xl" />
  }

  const allFields = [...module.required_fields, ...module.optional_fields]
  const requiredComplete = module.required_fields.every(
    (field) => collected[field.key]?.trim().length > 0
  )

  const totalRequired = module.required_fields.length
  const completedRequired = module.required_fields.filter(
    (f) => collected[f.key]?.trim().length > 0
  ).length
  const progress = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0

  const steps: ModuleField[][] = []
  for (let i = 0; i < allFields.length; i += 3) {
    steps.push(allFields.slice(i, i + 3))
  }
  const hasFileUploads = module.file_upload_prompts.length > 0

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps">Mission Readiness</span>
          <span className="text-sm font-medium text-[var(--apollo-blue)]">{progress}%</span>
        </div>
        <div className="h-2 bg-[var(--apollo-surface)] rounded-full overflow-hidden">
          <div
            className="h-2 bg-[var(--apollo-blue)] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current step fields */}
      {currentStep < steps.length && (
        <div className="space-y-6">
          {steps[currentStep].map((field) => (
            <div key={field.key}>
              <label className="label-caps block mb-2">
                {field.label}
                {module.required_fields.some((f) => f.key === field.key) && (
                  <span className="text-[var(--apollo-danger)] ml-1">*</span>
                )}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={collected[field.key] || ''}
                  onChange={(e) => saveField(field.key, e.target.value)}
                  rows={4}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white placeholder-[var(--apollo-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent resize-none"
                />
              ) : field.type === 'select' ? (
                <select
                  value={collected[field.key] || ''}
                  onChange={(e) => saveField(field.key, e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={collected[field.key] || ''}
                  onChange={(e) => saveField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-[var(--apollo-surface)] border border-[var(--apollo-border)] rounded-lg text-white placeholder-[var(--apollo-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--apollo-blue)] focus:border-transparent"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* File upload step */}
      {currentStep === steps.length && hasFileUploads && (
        <div className="space-y-6">
          <p className="label-caps">Upload Documents</p>
          {module.file_upload_prompts.map((prompt) => (
            <div key={prompt.kind} className="bg-[var(--apollo-navy)] border border-[var(--apollo-border)] rounded-xl p-5">
              <p className="text-sm text-[var(--apollo-text-muted)] mb-3">{prompt.label}</p>
              <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-[var(--apollo-border)] rounded-lg cursor-pointer hover:border-[var(--apollo-blue)]/40 transition-colors">
                <Upload className="w-5 h-5 text-[var(--apollo-text-faint)]" />
                <span className="text-sm text-[var(--apollo-text-muted)]">
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, prompt.kind)
                  }}
                />
              </label>
              {uploadedFiles
                .filter((f) => f.kind === prompt.kind)
                .map((f) => (
                  <div key={f.id} className="flex items-center gap-2 mt-2 text-sm text-[var(--apollo-success)]">
                    <Check className="w-4 h-4" />
                    {f.name}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--apollo-surface)] hover:bg-[var(--apollo-border)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-[var(--apollo-border)]"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < steps.length - 1 + (hasFileUploads ? 1 : 0) ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--apollo-surface)] hover:bg-[var(--apollo-border)] text-white rounded-lg transition-colors border border-[var(--apollo-border)]"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={launchMission}
            disabled={!requiredComplete}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--apollo-blue)] hover:bg-[var(--apollo-blue-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all glow-blue"
          >
            <Rocket className="w-4 h-4" />
            Launch Mission
          </button>
        )}
      </div>
    </div>
  )
}
