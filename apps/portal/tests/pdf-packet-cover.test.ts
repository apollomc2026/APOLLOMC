import { describe, expect, it } from 'vitest'
import { buildFullHtml } from '@/lib/apollo/pdf'
import type { LoadedBrand } from '@/lib/apollo/brands'
import type { Template } from '@/lib/apollo/templates'

const brand: LoadedBrand = {
  slug: 'on-spot-solutions',
  label: 'On Spot Solutions',
  logo_file: null,
  logo_path: null,
  logo_bytes: null,
  logo_mime: null,
  brand_md: '',
}

function template(slug: string, label: string, layout: Template['layout'] = 'contract'): Template {
  return {
    slug,
    label,
    layout,
    description: '',
    category: 'Test',
    supports_images: false,
    fields: [],
    sections: [],
    generation_notes: '',
  }
}

function render(selected: Template): string {
  return buildFullHtml({
    template: selected,
    brand,
    inputs: { entity_name: 'Northstar Fabrication', forecast_period: 'October–December 2026' },
    contentHtml: '<h1>Duplicate title</h1><h2>Forecast Details</h2><p>Verified content.</p>',
    documentId: 'DOC-1007',
    preparedDate: 'September 12, 2026',
  })
}

describe('packet cover invariant', () => {
  it('adds one branded cover to specialized financial packages', () => {
    const html = render(template('cash-flow-budget-package', 'Cash Flow Budget Package'))

    expect(html.match(/class="packet-cover"/g)).toHaveLength(1)
    expect(html).toContain('ON SPOT SOLUTIONS')
    expect(html).toContain('Northstar Fabrication &middot; October–December 2026')
    expect(html.indexOf('class="packet-cover"')).toBeLessThan(html.indexOf('class="ld-masthead"'))
  })

  it('does not add a cover to a standalone financial statement', () => {
    const html = render(template('cash-flow-statement', 'Cash Flow Statement', 'financial-statement'))
    expect(html).not.toContain('class="packet-cover"')
  })

  it('does not duplicate a cover supplied by an editorial packet layout', () => {
    const html = render(template('board-packet', 'Board Packet'))
    expect(html.match(/class="cover"/g)).toHaveLength(1)
    expect(html).not.toContain('class="packet-cover"')
  })
})
