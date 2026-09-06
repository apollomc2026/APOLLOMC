const required = [
  'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'APOLLO_ALLOWED_EMAILS',
  'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_PRIVATE',
  'ANTHROPIC_API_KEY', 'NEXT_PUBLIC_APP_URL', 'WORKER_SECRET_KEY', 'METIS_EXECUTOR_SHARED_SECRET',
  'METIS_EXECUTOR_CALLBACK_SECRET', 'METIS_CALLBACK_ORIGINS', 'APOLLO_EXECUTOR_CALLBACK_URL',
  'GOOGLE_DRIVE_CLIENT_ID', 'GOOGLE_DRIVE_CLIENT_SECRET', 'GOOGLE_DRIVE_REFRESH_TOKEN', 'GOOGLE_DRIVE_ROOT_FOLDER_ID',
]

const missing = required.filter(name => !process.env[name]?.trim())
const invalid = []
if (process.env.BILLING_MODE !== 'internal') invalid.push('BILLING_MODE must remain internal until post-acceptance payment activation')
for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_APP_URL', 'METIS_CALLBACK_ORIGINS', 'APOLLO_EXECUTOR_CALLBACK_URL']) {
  const value = process.env[name]
  if (value) { try { if (new URL(value).protocol !== 'https:') invalid.push(`${name} must use HTTPS`) } catch { invalid.push(`${name} must be a valid URL`) } }
}

if (missing.length || invalid.length) {
  console.error(JSON.stringify({ ready: false, missing, invalid }, null, 2))
  process.exit(1)
}
console.log(JSON.stringify({ ready: true, checked: required.length, billing: 'internal' }))
