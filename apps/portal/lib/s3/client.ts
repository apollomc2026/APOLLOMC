import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_PRIVATE || 'apollo-outputs-private'

export async function uploadToS3(key: string, body: Buffer | string, contentType?: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return key
}

export async function getFromS3(key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  )
  const stream = response.Body!
  const chunks: Uint8Array[] = []
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function getPresignedUrl(key: string, expiresIn = 900): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  )
}

export async function getUploadPresignedUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  )
}

export async function deleteFromS3(key: string) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  )
}

export { s3, BUCKET }
