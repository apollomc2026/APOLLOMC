import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('PWA privacy boundary', () => {
  it('never caches API responses or authenticated HTML', () => {
    const worker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
    expect(worker).toContain("url.pathname.startsWith('/api/')")
    expect(worker).toContain('event.respondWith(fetch(request))')
    expect(worker).not.toContain('apollo-api-')
    const precache = worker.match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/)?.[1] ?? ''
    expect(precache).not.toContain('/dashboard')
  })
})
