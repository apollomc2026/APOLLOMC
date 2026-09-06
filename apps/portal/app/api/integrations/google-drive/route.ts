import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { deleteDriveConnection, driveConnectionStatus, googleDriveAuthorizationUrl } from '@/lib/integrations/google-drive-auth'

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ connected: false, configured: false })
  }
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const url = new URL(request.url)
  if (url.searchParams.get('action') === 'connect') return NextResponse.redirect(googleDriveAuthorizationUrl(auth.user.userId))
  return NextResponse.json(await driveConnectionStatus(auth.user.userId))
}

export async function DELETE() {
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  await deleteDriveConnection(auth.user.userId)
  return NextResponse.json({ connected: false })
}
