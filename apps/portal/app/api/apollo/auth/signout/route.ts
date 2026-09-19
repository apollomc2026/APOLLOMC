import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, preflight } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request:Request) { return preflight(request) }

export async function POST(request:NextRequest) {
  const response=NextResponse.json({ok:true},{headers:{...corsHeaders(request),'Cache-Control':'private, no-store'}})
  const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
    cookies:{
      getAll:()=>request.cookies.getAll(),
      setAll:cookiesToSet=>cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,{...options,path:'/',sameSite:'lax',secure:process.env.NODE_ENV==='production'})),
    },
  })
  await supabase.auth.signOut()
  response.cookies.set('apollo-commander-policy','',{path:'/',maxAge:0,sameSite:'lax',secure:process.env.NODE_ENV==='production',httpOnly:true})
  return response
}
