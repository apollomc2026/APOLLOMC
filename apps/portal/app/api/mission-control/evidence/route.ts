import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadToS3 } from '@/lib/s3/client'

const ALLOWED = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain', 'image/png', 'image/jpeg'])
const MAX_BYTES = 20 * 1024 * 1024

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const form = await request.formData()
  const file = form.get('file')
  const conversationId = String(form.get('conversation_id') ?? '')
  if (!(file instanceof File) || !conversationId) return NextResponse.json({ error: 'A file and conversation are required' }, { status: 400 })
  if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) return NextResponse.json({ error: 'Unsupported file type or file exceeds 20 MB' }, { status: 415 })
  const db = await createClient()
  const owner = await db.from('apollo_conversations').select('id').eq('id', conversationId).eq('user_id', allowed.user.userId).single()
  if (owner.error || !owner.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const id = randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageKey = `mission-evidence/${conversationId}/${id}-${safeName}`
  await uploadToS3(storageKey, Buffer.from(await file.arrayBuffer()), file.type)
  const inserted = await db.from('apollo_conversation_evidence').insert({ id, conversation_id: conversationId, user_id: allowed.user.userId, original_name: file.name, storage_key: storageKey, mime_type: file.type, size_bytes: file.size }).select('id, original_name, extraction_status').single()
  if (inserted.error) return NextResponse.json({ error: inserted.error.message }, { status: 500 })
  return NextResponse.json({ id, name: file.name, status: inserted.data.extraction_status }, { status: 201 })
}
