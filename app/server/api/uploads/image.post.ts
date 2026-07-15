import { getCookie } from 'h3'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// POST /api/uploads/image
// Uploads an image server-side to S3 and returns a CDN URL. The bucket's
// policy only grants read access to its CloudFront Origin Access Identity —
// not the public — so the returned URL must be built from the CDN domain,
// not the raw S3 domain (a direct S3 URL 403s for anyone but that OAI).
//
// Body: { dataUrl: string, fileName: string, companyId?: number }

const MAX_BYTES = 10 * 1024 * 1024 // 10MB — keeps well under Amplify/Lambda payload limits

interface ImageUploadBody {
  dataUrl: string
  fileName: string
  companyId?: number
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-100)
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rb_auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const config = useRuntimeConfig(event)
  if (!config.s3Region) {
    throw createError({ statusCode: 500, message: 'NUXT_S3_REGION is not configured' })
  }
  if (!config.s3BucketName) {
    throw createError({ statusCode: 500, message: 'NUXT_S3_BUCKET_NAME is not configured' })
  }
  if (!config.s3CdnUrl) {
    throw createError({ statusCode: 500, message: 'NUXT_S3_CDN_URL is not configured' })
  }

  const body = await readBody<ImageUploadBody>(event)
  if (!body?.dataUrl || !body?.fileName) {
    throw createError({ statusCode: 400, message: 'dataUrl and fileName are required' })
  }

  // Cheap length check before decoding — base64 is ~4/3 the size of the
  // decoded bytes, so this catches oversized payloads without doing the
  // full decode first.
  if (body.dataUrl.length > MAX_BYTES * 1.4) {
    throw createError({ statusCode: 413, message: 'Image is too large (max 10MB)' })
  }

  const match = body.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) {
    throw createError({ statusCode: 400, message: 'Only base64 image data URLs are allowed' })
  }
  const [, contentType, base64Payload] = match

  const buffer = Buffer.from(base64Payload, 'base64')
  if (buffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, message: 'Image is too large (max 10MB)' })
  }

  const region = config.s3Region as string
  const bucket = config.s3BucketName as string

  const client = new S3Client({
    region,
    ...(config.s3AccessKeyId && config.s3SecretAccessKey
      ? {
          credentials: {
            accessKeyId: config.s3AccessKeyId as string,
            secretAccessKey: config.s3SecretAccessKey as string,
          },
        }
      : {}),
  })

  const key = `upload-logo/${body.companyId ?? 'shared'}/${crypto.randomUUID()}-${sanitizeFileName(body.fileName)}`

  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }))

  const cdnBase = (config.s3CdnUrl as string).replace(/\/+$/, '')
  return { url: `${cdnBase}/${key}` }
})
