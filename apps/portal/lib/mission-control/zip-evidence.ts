import JSZip from 'jszip'

export const EVIDENCE_FILE_ACCEPT = '.pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.zip'
const SUPPORTED = new Set(['pdf','docx','xlsx','csv','txt','png','jpg','jpeg'])
const MAX_ENTRY_BYTES = 20 * 1024 * 1024
const MAX_ARCHIVE_BYTES = 20 * 1024 * 1024
const MAX_EXPANDED_BYTES = 200 * 1024 * 1024
const MAX_ENTRIES = 100

type ZipEntryWithSize = JSZip.JSZipObject & { _data?: { uncompressedSize?: number } }

function extension(name:string) { return name.toLowerCase().split('.').pop() ?? '' }
function safeEntryName(name:string) {
  const normalized = name.replace(/\\/g,'/')
  if (normalized.startsWith('/') || /^[a-z]:/i.test(normalized) || normalized.split('/').includes('..')) return null
  return normalized.split('/').filter(Boolean).join('__').replace(/[^a-zA-Z0-9._-]/g,'_')
}

export interface ExpandedEvidencePackage { files:File[]; rejected:string[] }

export async function expandEvidencePackages(incoming:Iterable<File>):Promise<ExpandedEvidencePackage> {
  const files:File[]=[]; const rejected:string[]=[]
  for (const file of incoming) {
    if (extension(file.name) !== 'zip') { files.push(file); continue }
    if (file.size > MAX_ARCHIVE_BYTES) { rejected.push(`${file.name}: ZIP exceeds 20 MB`); continue }
    try {
      const archive = await JSZip.loadAsync(await file.arrayBuffer(), { checkCRC32:true, createFolders:false })
      const entries = Object.values(archive.files).filter(entry=>!entry.dir)
      if (entries.length > MAX_ENTRIES) { rejected.push(`${file.name}: ZIP contains more than ${MAX_ENTRIES} files`); continue }
      let expanded=0
      const accepted:ZipEntryWithSize[]=[]
      for (const entry of entries as ZipEntryWithSize[]) {
        const originalName=(entry as ZipEntryWithSize & { unsafeOriginalName?:string }).unsafeOriginalName ?? entry.name
        const name=safeEntryName(originalName); const size=Number(entry._data?.uncompressedSize)
        if (!Number.isFinite(size) || size < 0) { rejected.push(`${file.name}/${originalName}: invalid ZIP entry`); continue }
        expanded += size
        if (expanded > MAX_EXPANDED_BYTES) { rejected.push(`${file.name}: expanded package exceeds 200 MB`); accepted.length=0; break }
        if (!name) { rejected.push(`${file.name}/${originalName}: unsafe path rejected`); continue }
        if (!SUPPORTED.has(extension(name))) { rejected.push(`${file.name}/${entry.name}: unsupported evidence type`); continue }
        if (size > MAX_ENTRY_BYTES) { rejected.push(`${file.name}/${entry.name}: file exceeds 20 MB`); continue }
        accepted.push(entry)
      }
      for (const entry of accepted) {
        const originalName=(entry as ZipEntryWithSize & { unsafeOriginalName?:string }).unsafeOriginalName ?? entry.name
        const archiveName=file.name.replace(/\.zip$/i,'').replace(/[^a-zA-Z0-9._-]/g,'_')
        const name=`${archiveName}__${safeEntryName(originalName)!}`
        const bytes=await entry.async('uint8array')
        files.push(new File([Uint8Array.from(bytes).buffer],name,{ type:'application/octet-stream', lastModified:file.lastModified }))
      }
      if (!entries.length) rejected.push(`${file.name}: ZIP contains no files`)
    } catch { rejected.push(`${file.name}: ZIP could not be safely opened`) }
  }
  return { files, rejected }
}
