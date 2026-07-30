import { describe, expect, it } from 'vitest'
import { listBrands, loadBrand, loadBrandPalette } from '../lib/apollo/brands'

describe('METIS document brand', () => {
  it('is available to the APOLLO document pipeline', async () => {
    const brands = await listBrands()
    expect(brands.some((brand) => brand.slug === 'metis' && brand.label === 'Metis')).toBe(true)
    expect((await loadBrand('metis'))?.brand_md).toContain('One living intelligence')
  })

  it('uses the canonical METIS navy and gold palette', async () => {
    await expect(loadBrandPalette('metis')).resolves.toMatchObject({
      paper: '#f7f3e8',
      ink: '#09091a',
      accent: '#c9a84c',
    })
  })
})
