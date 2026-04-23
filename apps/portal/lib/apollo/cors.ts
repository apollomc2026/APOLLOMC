import { NextResponse } from 'next/server'

const PROD_ORIGIN = 'https://apollomc.ai'
const DEV_ORIGINS = new Set(['http://localhost:8080', 'http://localhost:3000'])

export function resolveAllowedOrigin(request: Request): string {
  const origin = request.headers.get('origin') ?? ''
  if (process.env.NODE_ENV === 'development' && DEV_ORIGINS.has(origin)) {
    return origin
  }
  return PROD_ORIGIN
}

export function corsHeaders(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
    'Access-Control-Allow-Credentials': 'false',
    Vary: 'Origin',
  }
}

export function preflight(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Apollo-Key',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  })
}

export function requireApiKey(request: Request): NextResponse | null {
  const apiKey = request.headers.get('x-apollo-key')
  const expected = process.env.APOLLO_API_KEY
  if (!expected) {
    return NextResponse.json(
      { error: 'Server misconfigured: APOLLO_API_KEY not set' },
      { status: 500, headers: corsHeaders(request) }
    )
  }
  if (!apiKey || apiKey !== expected) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders(request) }
    )
  }
  return null
}
