import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteFromS3, uploadToS3 } from '@/lib/s3/client'

const HEX = /^#[0-9a-f]{6}$/i
const UPLOAD_TYPES = new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg'])

const demo = [{ id:'brand-apollo', name:'Apollo Master', source:'created', primary_color:'#07131d', secondary_color:'#143448', accent_color:'#5ee7ff', heading_font:'Syne', body_font:'Inter', voice:'Precise, calm, evidence-led', source_file_name:null, is_default:true, created_at:'2026-09-06T12:00:00.000Z' }]

export async function GET() {
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json({ brand_kits: demo })
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  const db = await createClient()
  const result = await db.from('apollo_brand_kits').select('id,name,source,primary_color,secondary_color,accent_color,heading_font,body_font,voice,source_file_name,is_default,created_at').eq('user_id', auth.user.userId).order('created_at', { ascending:false })
  return result.error ? NextResponse.json({ error:result.error.message }, { status:500 }) : NextResponse.json({ brand_kits:result.data })
}

export async function POST(request:Request) {
  const test = process.env.PLAYWRIGHT_TESTING === 'true'
  const auth = test ? { ok:true as const, user:{ userId:'test-user' } } : await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData(); const file = form.get('file'); const name = String(form.get('name') ?? '').trim()
    if (!(file instanceof File) || name.length < 2) return NextResponse.json({ error:'A kit name and source file are required' }, { status:400 })
    if (!UPLOAD_TYPES.has(file.type) || file.size > 20 * 1024 * 1024) return NextResponse.json({ error:'Upload a PDF, DOCX, PNG, or JPG up to 20 MB' }, { status:415 })
    if (test) return NextResponse.json({ brand_kit:{ id:'brand-upload', name, source:'uploaded', source_file_name:file.name, created_at:new Date().toISOString() } }, { status:201 })
    const bytes = Buffer.from(await file.arrayBuffer()); const id = randomUUID(); const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,'_'); const key = `brand-kits/${auth.user.userId}/${id}-${safe}`
    await uploadToS3(key, bytes, file.type)
    const db = await createClient(); const result = await db.from('apollo_brand_kits').insert({ id, user_id:auth.user.userId, name, source:'uploaded', source_file_name:file.name, source_storage_key:key, source_sha256:createHash('sha256').update(bytes).digest('hex'), source_mime_type:file.type }).select().single()
    if (result.error) { await deleteFromS3(key).catch(() => undefined); return NextResponse.json({ error:result.error.message }, { status:500 }) }
    return NextResponse.json({ brand_kit:result.data }, { status:201 })
  }
  const body = await request.json(); const fields = ['primary_color','secondary_color','accent_color'] as const
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || fields.some(field => !HEX.test(body[field] ?? ''))) return NextResponse.json({ error:'Name and three six-digit hex colors are required' }, { status:400 })
  const record = { user_id:auth.user.userId, name:body.name.trim(), source:'created', primary_color:body.primary_color, secondary_color:body.secondary_color, accent_color:body.accent_color, heading_font:String(body.heading_font ?? '').trim() || null, body_font:String(body.body_font ?? '').trim() || null, voice:String(body.voice ?? '').trim() || null }
  if (test) return NextResponse.json({ brand_kit:{ id:'brand-created', ...record, created_at:new Date().toISOString() } }, { status:201 })
  const db = await createClient(); const result = await db.from('apollo_brand_kits').insert(record).select().single()
  return result.error ? NextResponse.json({ error:result.error.message }, { status:500 }) : NextResponse.json({ brand_kit:result.data }, { status:201 })
}
