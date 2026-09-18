import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const RETIRED_LEGACY_PREFIXES=['/api/jobs','/api/missions/','/api/apollo/submit','/api/apollo/submissions','/api/apollo/uploads','/api/delivery/'] as const

export function isRetiredLegacyPath(pathname:string):boolean{
  return RETIRED_LEGACY_PREFIXES.some(prefix=>pathname===prefix||pathname.startsWith(prefix.endsWith('/')?prefix:`${prefix}/`))
}

export async function proxy(request: NextRequest) {
  if(isRetiredLegacyPath(request.nextUrl.pathname)){
    return NextResponse.json(
      {error:'legacy_route_retired',replacement:'/new-mission'},
      {status:410,headers:{'Cache-Control':'no-store'}},
    )
  }
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
