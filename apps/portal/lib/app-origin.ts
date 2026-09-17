const PRODUCTION_APP_ORIGIN='https://app.apollomc.ai'

export function appOrigin(value=process.env.NEXT_PUBLIC_APP_URL):string {
  const candidate=value?.trim()||PRODUCTION_APP_ORIGIN
  const url=new URL(candidate)
  if(url.protocol!=='https:'&&url.hostname!=='localhost')throw new Error('NEXT_PUBLIC_APP_URL must use HTTPS')
  return url.origin
}

export function appUrl(path:string,value=process.env.NEXT_PUBLIC_APP_URL):string {
  return new URL(path,`${appOrigin(value)}/`).toString()
}
