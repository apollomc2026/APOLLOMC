import { NextResponse } from 'next/server'
import { isAllowedApolloEmail } from '@/lib/apollo/auth'
import { clientIp, rateLimit } from '@/lib/apollo/ratelimit'
import { sendEmail } from '@/lib/email/ses'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic='force-dynamic'

const response=()=>NextResponse.json({sent:true},{status:202,headers:{'Cache-Control':'no-store'}})

export async function POST(request:Request){
  let email=''
  try{email=String((await request.json())?.email??'').trim().toLowerCase()}catch{return response()}
  if(!/^\S+@\S+\.\S+$/.test(email)||!isAllowedApolloEmail(email))return response()

  const [byIp,byEmail]=await Promise.all([
    rateLimit(`auth-code:ip:${clientIp(request)}`,8,600),
    rateLimit(`auth-code:email:${email}`,5,600),
  ])
  if(!byIp.ok||!byEmail.ok)return NextResponse.json({error:'Too many access-code requests. Wait ten minutes and try again.'},{status:429})

  const supabase=await createServiceClient()
  const generated=await supabase.auth.admin.generateLink({type:'magiclink',email,options:{redirectTo:'https://app.apollomc.ai/auth/confirm'}})
  if(generated.error)throw generated.error
  const code=generated.data.properties?.email_otp
  if(!code)throw new Error('Supabase did not return an email OTP')

  await sendEmail({
    to:email,
    subject:'Your APOLLO access code',
    html:`<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827"><p style="color:#0b7285;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">APOLLO Mission Control</p><h1>Commander access</h1><p>Enter this single-use code in the APOLLO login screen:</p><p style="font-size:34px;font-weight:800;letter-spacing:10px;margin:28px 0">${code}</p><p style="color:#6b7280;font-size:13px">If you did not request this code, you can ignore this message.</p></div>`,
    text:`Your APOLLO Mission Control access code is ${code}. If you did not request this code, ignore this message.`,
  })
  return response()
}
