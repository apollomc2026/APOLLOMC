import {createHash} from 'node:crypto'
import {afterEach,describe,expect,it} from 'vitest'
import {assertControlledPdfDownload,controlledArtifactPath,controlledArtifactUrl,normalizedPdfTextSha256,projectControlledArtifacts} from '../lib/executor/artifact-access'

describe('APOLLO-controlled artifact access',()=>{
  afterEach(()=>{delete process.env.NEXT_PUBLIC_APP_URL})

  it('projects private custody links through the authenticated APOLLO gateway',()=>{
    const artifacts=projectControlledArtifacts('job 7',[{title:'Final QC Report',storage_file_id:'private-drive-file',web_view_url:'https://drive.google.com/private'}])
    expect(artifacts[0]).toMatchObject({storage_file_id:'private-drive-file',web_view_url:'/api/mission-control/artifact/job%207'})
    expect(artifacts[0].web_view_url).not.toContain('drive.google.com')
  })

  it('builds an absolute APOLLO pickup URL for completion email',()=>{
    process.env.NEXT_PUBLIC_APP_URL='https://app.apollomc.ai'
    expect(controlledArtifactPath('job-id')).toBe('/api/mission-control/artifact/job-id')
    expect(controlledArtifactUrl('job-id')).toBe('https://app.apollomc.ai/api/mission-control/artifact/job-id')
  })

  it('refuses to emit an uncontrolled URL without the APOLLO origin',()=>{
    expect(()=>controlledArtifactUrl('job-id')).toThrow(/NEXT_PUBLIC_APP_URL/)
  })

  it('serves only the exact PDF bytes recorded in the immutable artifact manifest',()=>{
    const bytes=Buffer.from('%PDF-1.7\ncontrolled artifact')
    const digest=createHash('sha256').update(bytes).digest('hex')
    expect(()=>assertControlledPdfDownload({bytes,mimeType:'application/pdf',contentSha256:digest})).not.toThrow()
    expect(()=>assertControlledPdfDownload({bytes:Buffer.from('%PDF-1.7\nchanged artifact'),mimeType:'application/pdf',contentSha256:digest})).toThrow(/integrity/)
    expect(()=>assertControlledPdfDownload({bytes,mimeType:'application/octet-stream',contentSha256:digest})).toThrow(/non-PDF/)
    expect(()=>assertControlledPdfDownload({bytes:Buffer.from('not a pdf'),mimeType:'application/pdf',contentSha256:digest})).toThrow(/invalid PDF/)
  })

  it('normalizes rendered text before binding its factual-content digest',()=>{
    expect(normalizedPdfTextSha256('  Site A\n\nPassed\t42  ')).toBe(normalizedPdfTextSha256('Site A Passed 42'))
    expect(normalizedPdfTextSha256('Site A Passed 43')).not.toBe(normalizedPdfTextSha256('Site A Passed 42'))
  })
})
