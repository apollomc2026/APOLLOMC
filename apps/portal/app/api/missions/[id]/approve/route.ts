import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: missionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership and status
  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .eq('status', 'brief_pending')
    .single()

  if (!mission) {
    return NextResponse.json({ error: 'Mission not found or not in brief_pending status' }, { status: 404 })
  }

  // Lock the spec and approve
  const now = new Date().toISOString()

  await supabase
    .from('missions')
    .update({
      status: 'queued',
      project_spec: mission.mission_brief,
      brief_approved_at: now,
      queued_at: now,
    })
    .eq('id', missionId)

  // Log event
  await supabase.from('events').insert({
    mission_id: missionId,
    user_id: user.id,
    event_type: 'brief_approved',
  })

  return NextResponse.json({ success: true })
}
