import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { searchPublicSiteAddresses } from '@/lib/mission-control/site-address'

export const maxDuration=45

export async function POST(request:Request){
  if(process.env.PLAYWRIGHT_TESTING!=='true'){
    const auth=await requireAllowedUser()
    if(!auth.ok)return NextResponse.json({error:auth.error},{status:auth.status})
  }
  const body=await request.json().catch(()=>null) as {site_name?:unknown}|null
  const siteName=typeof body?.site_name==='string'?body.site_name.trim():''
  if(siteName.length<2||siteName.length>200)return NextResponse.json({error:'A confirmed site name is required'},{status:400})
  if(process.env.PLAYWRIGHT_TESTING==='true')return NextResponse.json({candidates:[{address:'1 Broadway, Everett, MA 02149',source_url:'https://example.com/site',source_title:'Official site'}]})
  try{
    const candidates=await searchPublicSiteAddresses(siteName)
    return NextResponse.json({candidates})
  }catch(error){
    console.error('[mission-control] Public site-address search failed',{siteName,error:error instanceof Error?error.message:'unknown error'})
    return NextResponse.json({error:'Public address search is temporarily unavailable'},{status:502})
  }
}
