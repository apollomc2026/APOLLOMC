/** Install the canvas primitives pdf.js expects in a Node/Vercel runtime. */
export async function ensurePdfRuntimeGlobals():Promise<void>{
  if(typeof globalThis.DOMMatrix!=='undefined'&&typeof globalThis.ImageData!=='undefined'&&typeof globalThis.Path2D!=='undefined')return
  const canvas=await import('@napi-rs/canvas')
  Object.assign(globalThis,{
    DOMMatrix:globalThis.DOMMatrix??canvas.DOMMatrix,
    ImageData:globalThis.ImageData??canvas.ImageData,
    Path2D:globalThis.Path2D??canvas.Path2D,
  })
}
