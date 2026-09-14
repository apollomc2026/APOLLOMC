import { NextResponse } from 'next/server'
import { reconcileTerminalNotifications } from '@/lib/executor/notification-reconciler'

export const dynamic='force-dynamic'
export const maxDuration=60

export async function GET(request:Request) {
  const secret=process.env.CRON_SECRET?.trim()
  if (!secret || request.headers.get('authorization')!==`Bearer ${secret}`) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  return NextResponse.json(await reconcileTerminalNotifications())
}
