import {describe,expect,it} from 'vitest'
import {assertRenderedPdfIntegrity} from '../lib/executor/pdf-integrity'

function pdfBytes(size=2048){return Buffer.from(`%PDF-1.7\n${'x'.repeat(size)}\n%%EOF`,'latin1')}

describe('rendered PDF integrity gate',()=>{
  it('accepts a complete readable paged artifact',()=>{
    expect(assertRenderedPdfIntegrity(pdfBytes(),{pages:3,textCharacters:2400})).toMatchObject({pages:3,text_characters:2400})
  })

  it.each([
    [Buffer.from('%PDF-1.7\n%%EOF'),{pages:1,textCharacters:100},/unexpectedly small/],
    [Buffer.from(`NOTPDF${'x'.repeat(2048)}%%EOF`),{pages:1,textCharacters:100},/signature/],
    [Buffer.from(`%PDF-1.7${'x'.repeat(2048)}`),{pages:1,textCharacters:100},/end-of-file/],
    [pdfBytes(),{pages:0,textCharacters:100},/no readable pages/],
    [pdfBytes(),{pages:1,textCharacters:12},/insufficient readable document text/],
  ])('fails closed for a corrupt or empty rendered artifact',(bytes,metrics,error)=>{
    expect(()=>assertRenderedPdfIntegrity(bytes as Buffer,metrics as {pages:number;textCharacters:number})).toThrow(error as RegExp)
  })
})
