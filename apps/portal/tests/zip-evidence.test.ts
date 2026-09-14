import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { EVIDENCE_FILE_ACCEPT, expandEvidencePackages } from '../lib/mission-control/zip-evidence'

async function archive(name:string, entries:Record<string,string|Uint8Array>) {
  const zip=new JSZip()
  for (const [path,content] of Object.entries(entries)) zip.file(path,content)
  const bytes=await zip.generateAsync({ type:'uint8array', compression:'DEFLATE' })
  return new File([Uint8Array.from(bytes).buffer],name,{ type:'application/zip', lastModified:1 })
}

describe('secure ZIP evidence intake', () => {
  it('advertises ZIP packages alongside the executable evidence types', () => {
    expect(EVIDENCE_FILE_ACCEPT).toContain('.zip')
  })

  it('expands supported entries, preserves package provenance, and reports unsupported entries', async () => {
    const input=await archive('Flowbird.zip',{
      'day1/report.txt':'Crew completed loop testing.',
      'day1/results.csv':'id,result\nL1,PASS',
      'preview.exe':'not evidence',
    })
    const result=await expandEvidencePackages([input])
    expect(result.files.map(file=>file.name).sort()).toEqual(['Flowbird__day1__report.txt','Flowbird__day1__results.csv'])
    expect(await result.files[0].text()).toContain('Crew completed')
    expect(result.rejected).toEqual([expect.stringMatching(/preview\.exe: unsupported evidence type/)])
  })

  it('rejects traversal paths rather than flattening them into trusted evidence', async () => {
    const input=await archive('unsafe.zip',{ '../outside.txt':'must not enter custody', 'safe.txt':'accepted' })
    const result=await expandEvidencePackages([input])
    expect(result.files.map(file=>file.name)).toEqual(['unsafe__safe.txt'])
    expect(result.rejected.join(' ')).toMatch(/unsafe path rejected/)
  })

  it('rejects a highly compressed entry that expands beyond the per-file ceiling', async () => {
    const input=await archive('bomb.zip',{ 'oversize.txt':new Uint8Array(20*1024*1024+1) })
    const result=await expandEvidencePackages([input])
    expect(result.files).toHaveLength(0)
    expect(result.rejected.join(' ')).toMatch(/file exceeds 20 MB/)
  })
})
