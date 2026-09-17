import type { ArtifactManifest } from './contracts'

export function controlledArtifactPath(jobId:string){
  const normalized=jobId.trim()
  if(!normalized)throw new Error('Artifact access requires a job id')
  return `/api/mission-control/artifact/${encodeURIComponent(normalized)}`
}

export function controlledArtifactUrl(jobId:string,appUrl=process.env.NEXT_PUBLIC_APP_URL){
  if(!appUrl)throw new Error('NEXT_PUBLIC_APP_URL is required for artifact access')
  return new URL(controlledArtifactPath(jobId),appUrl).toString()
}

/** Keep private Drive custody internal; every operator-facing link returns
 * through APOLLO authentication and ownership checks. */
export function projectControlledArtifacts<T extends Partial<ArtifactManifest>>(jobId:string,artifacts:T[]):T[]{
  const web_view_url=controlledArtifactPath(jobId)
  return artifacts.map(artifact=>({...artifact,web_view_url}))
}
