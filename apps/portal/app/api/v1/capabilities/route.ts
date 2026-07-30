import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/apollo/packages-loader'
import { googleDriveConfigured } from '@/lib/executor/google-drive'

export const dynamic = 'force-dynamic'

export async function GET() {
  const driveReady = googleDriveConfigured()
  const deliverables = getCatalog().industries
    .filter((industry) => industry.status === 'active')
    .flatMap((industry) => industry.deliverables.map((deliverable) => deliverable.slug))
    .sort()
  return NextResponse.json({
    executor_id: 'apollo-documents',
    contract_version: '1.0',
    service_version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'development',
    health: driveReady ? 'healthy' : 'degraded',
    asynchronous: true,
    supports_callbacks: true,
    supports_cancellation: true,
    formats: ['pdf'],
    maximum_sensitivity: 'confidential',
    deliverables,
    commercial_mode_separate: true,
    artifact_custody: {
      provider: 'google-drive',
      ready: driveReady,
      lifecycle: 'draft',
      exact_folder_required: true,
    },
  })
}
