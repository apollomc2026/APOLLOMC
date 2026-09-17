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
    html:`<div style="margin:0;padding:36px 16px;background:#05070d;color:#f4f7ff;font-family:Arial,Helvetica,sans-serif"><div style="max-width:560px;margin:0 auto;border:1px solid #173644;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,#07121a,#090912 62%,#170c08)"><div style="height:4px;background:linear-gradient(90deg,#24d8ff,#487cff 42%,#9b4acb 66%,#ff7a18)"></div><div style="padding:38px 38px 34px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td><p style="margin:0;color:#54e4ff;font-size:11px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase">APOLLO · Mission Control</p></td><td align="right"><span style="display:inline-block;padding:6px 10px;border:1px solid #1d6475;border-radius:999px;color:#69e7ff;font-size:9px;letter-spacing:1.5px">SECURE CHANNEL</span></td></tr></table><h1 style="margin:34px 0 10px;font-size:34px;line-height:1.05;letter-spacing:-1px;color:#fff">Commander access.</h1><p style="margin:0;color:#a9b1bf;font-size:15px;line-height:1.7">Enter this single-use ignition code in the APOLLO login screen.</p><div style="margin:30px 0;padding:25px 18px;border:1px solid #f09542;border-radius:13px;text-align:center;background:radial-gradient(circle at 18% 50%,#0b769b,transparent 40%),radial-gradient(circle at 82% 50%,#a94412,transparent 45%),#161329;box-shadow:0 0 28px rgba(255,105,18,.18)"><span style="display:block;margin-bottom:10px;color:#ffd4ad;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase">One-time launch credential</span><strong style="display:block;color:#fff;font-size:36px;letter-spacing:10px;text-shadow:0 2px 8px #000">${code}</strong></div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #18232d;padding-top:20px"><tr><td style="color:#7e8997;font-size:12px;line-height:1.6">This credential expires automatically and can only be used once.<br>If you did not request it, no action is required.</td><td align="right" style="color:#ff8a24;font-size:10px;font-weight:700;letter-spacing:1.4px">IDENTITY CHECK</td></tr></table></div></div><p style="max-width:560px;margin:16px auto 0;text-align:center;color:#47515e;font-size:9px;letter-spacing:1.5px;text-transform:uppercase">APOLLO Mission Control · Controlled Access</p></div>`,
    text:`Your APOLLO Mission Control access code is ${code}. If you did not request this code, ignore this message.`,
  })
  return response()
}
