import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_COMMANDER_SESSION_HOURS = 8
const COMMANDER_POLICY_COOKIE = 'apollo-commander-policy'
const COMMANDER_POLICY_VERSION = '2'

export function isCommanderSessionCurrent(lastSignInAt:string|undefined,now=Date.now(),maxHours=DEFAULT_COMMANDER_SESSION_HOURS){
  if(!lastSignInAt)return false
  const signedInAt=Date.parse(lastSignInAt)
  return Number.isFinite(signedInAt)&&now-signedInAt>=0&&now-signedInAt<maxHours*60*60*1000
}

function privateResponse<T extends NextResponse>(response:T):T{
  response.headers.set('Cache-Control','private, no-store')
  return response
}

function redirectWithSessionCookies(url:URL,source:NextResponse){
  const redirect=NextResponse.redirect(url)
  source.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie))
  return privateResponse(redirect)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const protectedPaths = ['/dashboard', '/new-mission', '/mission', '/review', '/files', '/telemetry', '/archive', '/settings', '/launch-pad']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    if (!isProtected) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('configuration', 'required')
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const configuredHours=Number(process.env.APOLLO_SESSION_MAX_HOURS||DEFAULT_COMMANDER_SESSION_HOURS)
  const maxSessionHours=Number.isFinite(configuredHours)&&configuredHours>0?configuredHours:DEFAULT_COMMANDER_SESSION_HOURS
  let currentUser=user
  const currentPolicy=request.cookies.get(COMMANDER_POLICY_COOKIE)?.value===COMMANDER_POLICY_VERSION
  const sessionExpired=Boolean(user&&(!currentPolicy||!isCommanderSessionCurrent(user.last_sign_in_at,Date.now(),maxSessionHours)))
  if(sessionExpired){
    await supabase.auth.signOut()
    supabaseResponse.cookies.set(COMMANDER_POLICY_COOKIE,'',{path:'/',maxAge:0,sameSite:'lax',secure:process.env.NODE_ENV==='production',httpOnly:true})
    currentUser=null
  }

  if (isProtected && !currentUser) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    if(sessionExpired)url.searchParams.set('reason','session_expired')
    return redirectWithSessionCookies(url,supabaseResponse)
  }

  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPage && currentUser) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return privateResponse(NextResponse.redirect(url))
  }

  return privateResponse(supabaseResponse)
}
