import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/apollo/packages-loader'
import { googleDriveConfigured } from '@/lib/executor/google-drive'

export const dynamic = 'force-dynamic'

export async function GET() {
  const drivePlatformConfigured = googleDriveConfigured()
  const deliverables = getCatalog().industries
    .filter((industry) => industry.status === 'active')
    .flatMap((industry) => industry.deliverables.map((deliverable) => deliverable.slug))
    .sort()
  return NextResponse.json({
    executor_id: 'apollo-documents',
    contract_version: '1.0',
    service_version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'development',
    health: drivePlatformConfigured ? 'healthy' : 'degraded',
    asynchronous: true,
    supports_callbacks: false,
    supports_cancellation: true,
    formats: ['pdf'],
    maximum_sensitivity: 'confidential',
    deliverables,
    commercial_mode_separate: true,
    artifact_custody: {
      provider: 'google-drive',
      platform_configured: drivePlatformConfigured,
      ready: false,
      readiness: drivePlatformConfigured ? 'user_connection_required' : 'platform_configuration_required',
      lifecycle: 'draft',
      exact_folder_required: true,
      per_user_connection_required: true,
    },
  })
}
