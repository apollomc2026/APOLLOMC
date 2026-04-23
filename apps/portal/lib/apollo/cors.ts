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
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

export function preflight(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  })
}
