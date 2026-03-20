import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToS3 } from '@/lib/s3/client'

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

  // Verify mission ownership
  const { data: mission } = await supabase
    .from('missions')
    .select('id')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .single()

  if (!mission) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const kind = formData.get('kind') as string

  if (!file || !kind) {
    return NextResponse.json({ error: 'Missing file or kind' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const s3Key = `uploads/${missionId}/${Date.now()}-${file.name}`

  await uploadToS3(s3Key, buffer, file.type)

  const { data: uploaded } = await supabase
    .from('uploaded_files')
    .insert({
      mission_id: missionId,
      kind,
      original_name: file.name,
      s3_key: s3Key,
      mime_type: file.type,
      file_size_bytes: buffer.length,
      extraction_status: 'pending',
    })
    .select()
    .single()

  // TODO: Trigger extraction Lambda via AWS Lambda invoke

  return NextResponse.json(uploaded)
}
