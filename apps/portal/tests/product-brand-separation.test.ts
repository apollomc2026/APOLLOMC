import { afterEach, describe, expect, it } from 'vitest'
import { isAllowedBrandSlug, listBrands, loadBrand, loadBrandPalette } from '../lib/apollo/brands'
import { POST as interpret } from '../app/api/mission-control/interpret/route'

describe('APOLLO built-in brand separation', () => {
  afterEach(() => { delete process.env.PLAYWRIGHT_TESTING })

  it('exposes only APOLLO and the authorized internal pilot identity', async () => {
    const brands = await listBrands()
    expect(brands.map((brand) => brand.slug).sort()).toEqual(['apollo', 'on-spot-solutions'])
  })

  it.each(['atlas', 'habi', 'metis', 'themis'])('refuses the separate %s product identity', async (slug) => {
    expect(isAllowedBrandSlug(slug)).toBe(false)
    await expect(loadBrand(slug)).resolves.toBeNull()
    await expect(loadBrandPalette(slug)).resolves.toMatchObject({ accent:'#6be3ff' })
  })

  it.each(['atlas', 'habi', 'metis', 'themis'])('rejects %s at the conversational intake boundary', async (slug) => {
    process.env.PLAYWRIGHT_TESTING = 'true'
    const response = await interpret(new Request('http://localhost/api/mission-control/interpret', {
      method:'POST', headers:{ 'content-type':'application/json' },
      body:JSON.stringify({ message:'Prepare a proposal for an internal pilot.', brand_profile_id:slug }),
    }))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error:'Brand profile is invalid' })
  })
})
