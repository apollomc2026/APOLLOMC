import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  // Sanitize slug to prevent path traversal
  const safeSlug = slug.replace(/[^a-z0-9-]/g, '')

  try {
    const modulePath = path.join(
      process.cwd(),
      '..',
      '..',
      'packages',
      'catalog',
      'modules',
      `${safeSlug}.json`
    )
    const content = await readFile(modulePath, 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }
}
