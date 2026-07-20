import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Machine-to-machine executor routes authenticate with signed request
  // headers. They must not depend on the browser's Supabase session layer.
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next({ request })
  }

  if (process.env.PLAYWRIGHT_TESTING === 'true') {
    return NextResponse.next({ request })
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
