import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { downloadDriveArtifact } from '@/lib/executor/google-drive'
import { assertControlledPdfDownload } from '@/lib/executor/artifact-access'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Artifact = { storage_file_id?: string; mime_type?: string; title?: string; filename?:string; content_sha256?:string; version?: number }

function safeFilename(value: string) {
  const stem = value.replace(/[^a-z0-9._ -]+/gi, '').trim().replace(/\s+/g, '-') || 'apollo-deliverable'
  return stem.toLowerCase().endsWith('.pdf') ? stem : `${stem}.pdf`
}

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  const { jobId } = await context.params
  const db = await createServiceClient()
  const result = await db.from('apollo_document_jobs').select('requested_by,artifacts').eq('id', jobId).eq('requested_by', auth.user.userId).maybeSingle()
  if (result.error) return NextResponse.json({ error:'Artifact lookup failed' }, { status:500 })
  if (!result.data) return NextResponse.json({ error:'Artifact not found' }, { status:404 })
  const artifact = ((result.data.artifacts as Artifact[] | null) ?? [])[0]
  if (!artifact?.storage_file_id || artifact.mime_type !== 'application/pdf' || !artifact.content_sha256) return NextResponse.json({ error:'PDF artifact is unavailable' }, { status:404 })
  try {
    const file = await downloadDriveArtifact({ userId:auth.user.userId, fileId:artifact.storage_file_id })
    const bytes=Buffer.from(file.bytes)
    assertControlledPdfDownload({bytes,mimeType:file.mimeType,contentSha256:artifact.content_sha256})
    return new Response(bytes, { headers:{
      'Content-Type':'application/pdf',
      'Content-Disposition':`inline; filename="${safeFilename(artifact.filename || artifact.title || 'apollo-deliverable')}"`,
      'Cache-Control':'private, no-store, max-age=0',
      'X-Content-Type-Options':'nosniff',
    } })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Artifact could not be opened'
    return NextResponse.json({ error:message }, { status:/reconnect/i.test(message) ? 409 : 502 })
  }
}
