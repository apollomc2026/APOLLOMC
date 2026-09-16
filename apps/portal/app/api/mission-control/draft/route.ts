import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request:Request) {
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  let body:{ conversation_id?:string }
  try { body = await request.json() } catch { return NextResponse.json({ error:'Invalid request body' }, { status:400 }) }
  const conversationId = body.conversation_id?.trim()
  if (!conversationId) return NextResponse.json({ error:'Mission conversation is required' }, { status:400 })
  const db = await createServiceClient()
  const mission = await db.from('apollo_conversations').select('id').eq('id',conversationId).eq('user_id',auth.user.userId).maybeSingle()
  if (mission.error) return NextResponse.json({ error:mission.error.message }, { status:500 })
  if (!mission.data) return NextResponse.json({ error:'Mission draft was not found' }, { status:404 })
  const jobs = await db.from('apollo_document_jobs').select('id').eq('conversation_id',conversationId).eq('requested_by',auth.user.userId).limit(1)
  if (jobs.error) return NextResponse.json({ error:jobs.error.message }, { status:500 })
  if ((jobs.data ?? []).length) return NextResponse.json({ error:'Launched missions cannot be cleared. Use mission controls or archive the completed mission.' }, { status:409 })
  const archived = await db.from('apollo_conversations').update({ status:'archived', updated_at:new Date().toISOString() }).eq('id',conversationId).eq('user_id',auth.user.userId).select('id').maybeSingle()
  if (archived.error || !archived.data) return NextResponse.json({ error:archived.error?.message ?? 'Mission draft could not be cancelled' }, { status:500 })
  return NextResponse.json({ conversation_id:conversationId, status:'archived' })
}
