import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import type { CORSRule } from '@aws-sdk/client-s3'
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

export async function ensureUploadCors(origin:string){
  const parsed=new URL(origin)
  const permitted=parsed.protocol==='https:'&&(parsed.hostname==='apollomc.ai'||parsed.hostname.endsWith('.apollomc.ai')||parsed.hostname.endsWith('.vercel.app'))
  if(!permitted)throw new Error('Upload origin is not permitted')
  let rules:CORSRule[]=[]
  try{rules=(await s3.send(new GetBucketCorsCommand({Bucket:BUCKET}))).CORSRules??[]}catch(cause){if(!(cause instanceof Error)||!['NoSuchCORSConfiguration','NoSuchCORS'].includes(cause.name))throw cause}
  const index=rules.findIndex(rule=>rule.ID==='apollo-evidence-direct-upload')
  const existing=index>=0?rules[index]:undefined
  const origins=[...new Set([...(existing?.AllowedOrigins??[]),origin,'https://portal.apollomc.ai'])]
  if(existing&&origins.length===existing.AllowedOrigins?.length)return
  const rule={ID:'apollo-evidence-direct-upload',AllowedOrigins:origins,AllowedMethods:['PUT'],AllowedHeaders:['content-type'],ExposeHeaders:['etag'],MaxAgeSeconds:3600}
  if(index>=0)rules[index]=rule;else rules.push(rule)
  await s3.send(new PutBucketCorsCommand({Bucket:BUCKET,CORSConfiguration:{CORSRules:rules}}))
}

export async function deleteFromS3(key: string) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  )
}

export { s3, BUCKET }
