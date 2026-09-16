import type { DeliverableSpecification } from './contracts'

export type EvidenceUploadResponse = {
  id?:string; name?:string; status?:'pending'|'verified'|'conflict'|'failed';
  facts?:DeliverableSpecification['content']['facts']; specification?:DeliverableSpecification;
  specification_version?:number; readiness?:number; error?:string
}

const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024

export async function uploadMissionEvidence(conversationId:string,file:File):Promise<EvidenceUploadResponse>{
  if(file.size<=DIRECT_UPLOAD_THRESHOLD){
    const form=new FormData();form.set('conversation_id',conversationId);form.set('file',file)
    const response=await fetch('/api/mission-control/evidence',{method:'POST',body:form})
    const body=await response.json() as EvidenceUploadResponse
    if(!response.ok)throw new Error(body.error||'upload rejected')
    return body
  }
  const initiated=await fetch('/api/mission-control/evidence/direct',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({conversation_id:conversationId,name:file.name,mime_type:file.type,size_bytes:file.size})})
  const ticket=await initiated.json() as {id?:string;upload_url?:string;mime_type?:string;error?:string}
  if(!initiated.ok||!ticket.id||!ticket.upload_url||!ticket.mime_type)throw new Error(ticket.error||'secure upload could not be initialized')
  const stored=await fetch(ticket.upload_url,{method:'PUT',headers:{'content-type':ticket.mime_type},body:file})
  if(!stored.ok)throw new Error(`secure storage rejected the upload (${stored.status})`)
  const completed=await fetch('/api/mission-control/evidence/direct',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({conversation_id:conversationId,evidence_id:ticket.id})})
  const body=await completed.json() as EvidenceUploadResponse
  if(!completed.ok)throw new Error(body.error||'uploaded evidence could not be verified')
  return body
}
