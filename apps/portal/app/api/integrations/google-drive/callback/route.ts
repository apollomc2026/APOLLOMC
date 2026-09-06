import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { exchangeDriveAuthorizationCode, saveDriveConnection, verifyDriveOAuthState } from '@/lib/integrations/google-drive-auth'

export async function GET(request: Request) {
  const auth = await requireAllowedUser()
  const settings = new URL('/settings', process.env.NEXT_PUBLIC_APP_URL)
  if (!auth.ok) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL))
  const url = new URL(request.url)
  try {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!code || !state) throw new Error('Google did not return authorization')
    verifyDriveOAuthState(state, auth.user.userId)
    const token = await exchangeDriveAuthorizationCode(code)
    await saveDriveConnection(auth.user.userId, { refresh_token: token.refresh_token!, scope: token.scope, id_token: token.id_token })
    settings.searchParams.set('drive', 'connected')
  } catch (error) {
    settings.searchParams.set('drive', 'error')
    console.error('[google-drive] OAuth callback failed', error instanceof Error ? error.message : 'unknown error')
  }
  return NextResponse.redirect(settings)
}
