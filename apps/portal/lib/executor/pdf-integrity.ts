export interface RenderedPdfIntegrity {
  bytes:number
  pages:number
  text_characters:number
}

export function assertRenderedPdfIntegrity(bytes:Buffer,metrics:{pages:number;textCharacters:number}):RenderedPdfIntegrity {
  if(bytes.length<1024)throw new Error('Rendered PDF integrity failed: artifact is unexpectedly small')
  if(bytes.subarray(0,5).toString('ascii')!=='%PDF-')throw new Error('Rendered PDF integrity failed: PDF signature is missing')
  if(!bytes.subarray(Math.max(0,bytes.length-4096)).toString('latin1').includes('%%EOF'))throw new Error('Rendered PDF integrity failed: end-of-file marker is missing')
  if(!Number.isSafeInteger(metrics.pages)||metrics.pages<1)throw new Error('Rendered PDF integrity failed: artifact contains no readable pages')
  if(!Number.isSafeInteger(metrics.textCharacters)||metrics.textCharacters<40)throw new Error('Rendered PDF integrity failed: artifact contains insufficient readable document text')
  return {bytes:bytes.length,pages:metrics.pages,text_characters:metrics.textCharacters}
}

export async function verifyRenderedPdf(pdf:Buffer):Promise<RenderedPdfIntegrity> {
  const {PDFParse}=await import('pdf-parse')
  const parser=new PDFParse({data:new Uint8Array(pdf)})
  try{
    const text=await parser.getText()
    return assertRenderedPdfIntegrity(pdf,{pages:text.total,textCharacters:text.text.replace(/\s+/g,' ').trim().length})
  }catch(error){
    if(error instanceof Error&&error.message.startsWith('Rendered PDF integrity failed:'))throw error
    throw new Error(`Rendered PDF integrity failed: ${error instanceof Error?error.message:'artifact could not be parsed'}`)
  }finally{await parser.destroy().catch(()=>{})}
}
