import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3, BUCKET, uploadToS3 } from '@/lib/s3/client'

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// AWS SigV4 maximum presign expiry is 7 days.
const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60

export interface UploadSubmissionOutputArgs {
  submissionId: string
  docxBuffer: Buffer
  submissionJson: Record<string, unknown>
  filename: string
}

export interface UploadSubmissionOutputResult {
  s3Prefix: string
  s3Key: string
  downloadUrl: string
  expiresAt: string
}

export class StorageUploadError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'StorageUploadError'
  }
}

export class StoragePresignError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'StoragePresignError'
  }
}

function sanitizeFilename(name: string): string {
  // Strip path separators and control chars; keep alphanum, dash, underscore, dot.
  return name.replace(/[^A-Za-z0-9._-]/g, '_') || 'output.docx'
}

export async function uploadSubmissionOutput(
  args: UploadSubmissionOutputArgs
): Promise<UploadSubmissionOutputResult> {
  const safeFilename = sanitizeFilename(args.filename)
  const s3Prefix = `apollo/${args.submissionId}/`
  const s3Key = `${s3Prefix}${safeFilename}`
  const auditKey = `${s3Prefix}submission.json`

  try {
    await uploadToS3(s3Key, args.docxBuffer, DOCX_MIME)
  } catch (err) {
    throw new StorageUploadError(
      `Failed to upload DOCX to S3 (bucket=${BUCKET}, key=${s3Key}): ${(err as Error).message}`,
      err
    )
  }

  try {
    const auditBody = Buffer.from(JSON.stringify(args.submissionJson, null, 2), 'utf8')
    await uploadToS3(auditKey, auditBody, 'application/json')
  } catch (err) {
    throw new StorageUploadError(
      `Failed to upload audit JSON to S3 (bucket=${BUCKET}, key=${auditKey}): ${(err as Error).message}`,
      err
    )
  }

  let downloadUrl: string
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
      ResponseContentType: DOCX_MIME,
    })
    downloadUrl = await getSignedUrl(s3, command, { expiresIn: DEFAULT_EXPIRY_SECONDS })
  } catch (err) {
    throw new StoragePresignError(
      `Failed to presign S3 GET URL for key=${s3Key}: ${(err as Error).message}`,
      err
    )
  }

  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_SECONDS * 1000).toISOString()

  return {
    s3Prefix,
    s3Key,
    downloadUrl,
    expiresAt,
  }
}
