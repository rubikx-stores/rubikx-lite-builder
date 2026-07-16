import { getCookie } from 'h3'
import { createHash } from 'node:crypto'
import { uploadUrlCache } from '~/server/services/uploads/lruCache'
import { buildKey, uploadImage } from '~/server/services/uploads/s3Client'

// POST /api/uploads/image
// Uploads an image server-side to S3 and returns a CDN URL. The bucket's
// policy only grants read access to its CloudFront Origin Access Identity —
// not the public — so the returned URL must be built from the CDN domain,
// not the raw S3 domain (a direct S3 URL 403s for anyone but that OAI).
//
// Images are routed into one of two prefixes based on the field they came
// from: logo fields go to upload-logo/, everything else to
// headless-lite-images/. The S3 key is derived from the image's content hash
// rather than a random id, so re-uploading identical bytes reuses the
// existing object (via the LRU cache below) instead of duplicating storage,
// and concurrent uploads of the same bytes coalesce into one PutObject call.
//
// Body: { dataUrl: string, fileName: string, companyId?: number, fieldKey?: string }

const MAX_BYTES = 10 * 1024 * 1024 // 10MB — keeps well under Amplify/Lambda payload limits

interface ImageUploadBody {
  dataUrl: string
  fileName: string
  companyId?: number
  fieldKey?: string
}

// Single-flight map: S3 key → in-progress upload promise.
const inFlight = new Map<string, Promise<string>>()

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

  const folder = body.fieldKey?.toLowerCase().includes('logo') ? 'upload-logo' : 'headless-lite-images'
  const contentHash = createHash('sha256').update(buffer).digest('hex').slice(0, 20)
  const key = buildKey({ folder, companyId: body.companyId, contentHash, fileName: body.fileName })

  const cached = uploadUrlCache.get(key)
  if (cached) return { url: cached }

  const s3Cfg = {
    region: config.s3Region as string,
    bucketName: config.s3BucketName as string,
    cdnUrl: config.s3CdnUrl as string,
    accessKeyId: config.s3AccessKeyId as string | undefined,
    secretAccessKey: config.s3SecretAccessKey as string | undefined,
  }

  try {
    let uploadPromise = inFlight.get(key)
    if (!uploadPromise) {
      uploadPromise = (async () => {
        try {
          const url = await uploadImage(s3Cfg, key, buffer, contentType)
          uploadUrlCache.set(key, url)
          return url
        } finally {
          inFlight.delete(key)
        }
      })()
      inFlight.set(key, uploadPromise)
    }

    return { url: await uploadPromise }
  } catch (err) {
    console.error('[uploads/image] S3 PutObject failed:', err)
    throw createError({ statusCode: 500, message: 'Upload failed' })
  }
})
