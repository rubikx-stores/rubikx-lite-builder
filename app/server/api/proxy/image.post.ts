import { getCookie } from 'h3'
import { createHash } from 'node:crypto'
import { uploadUrlCache } from '~/server/services/uploads/lruCache'
import { buildKey, uploadImage } from '~/server/services/uploads/s3Client'

// POST /api/proxy/image
// Fetches an external image URL server-side, uploads it to S3, and returns a
// CDN URL. This prevents raw third-party URLs from being embedded in published
// pages (broken links, hotlink bans, slow origins) and routes all image traffic
// through the same CDN as user-uploaded images.
//
// SSRF protection: private/loopback ranges and non-http(s) schemes are blocked.
// Deduplication: same content hash → same S3 key → LRU cache hit on repeat calls.
//
// Body: { url: string, companyId?: number, fieldKey?: string }

const MAX_BYTES = 10 * 1024 * 1024
const FETCH_TIMEOUT_MS = 15_000

// Matches hostnames that resolve to private/loopback ranges
const BLOCKED_HOST_RE =
  /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|31)\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|::1|fe80:)/i

interface ProxyImageBody {
  url: string
  companyId?: number
  fieldKey?: string
}

const inFlight = new Map<string, Promise<string>>()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rb_auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const config = useRuntimeConfig(event)
  if (!config.s3Region || !config.s3BucketName || !config.s3CdnUrl) {
    throw createError({ statusCode: 500, message: 'S3 is not configured' })
  }

  const body = await readBody<ProxyImageBody>(event)
  if (!body?.url) {
    throw createError({ statusCode: 400, message: 'url is required' })
  }

  let parsed: URL
  try {
    parsed = new URL(body.url)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({ statusCode: 400, message: 'Only http/https URLs are allowed' })
  }

  if (BLOCKED_HOST_RE.test(parsed.hostname)) {
    throw createError({ statusCode: 400, message: 'URL not allowed' })
  }

  let response: Response
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    response = await fetch(body.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RubikX-Builder/1.0' },
    })
    clearTimeout(timer)
  } catch {
    throw createError({ statusCode: 422, message: 'Could not fetch the image URL' })
  }

  if (!response.ok) {
    throw createError({ statusCode: 422, message: `Remote server returned ${response.status}` })
  }

  const rawContentType = response.headers.get('content-type') ?? 'image/jpeg'
  const contentType = rawContentType.split(';')[0].trim()
  if (!contentType.startsWith('image/')) {
    throw createError({ statusCode: 400, message: 'URL does not point to an image' })
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, message: 'Remote image is too large (max 10MB)' })
  }

  const folder = body.fieldKey?.toLowerCase().includes('logo') ? 'upload-logo' : 'headless-lite-images'
  const contentHash = createHash('sha256').update(buffer).digest('hex').slice(0, 20)
  const fileName = parsed.pathname.split('/').filter(Boolean).pop() || 'image'
  const key = buildKey({ folder, companyId: body.companyId, contentHash, fileName })

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
    console.error('[proxy/image] S3 PutObject failed:', err)
    throw createError({ statusCode: 500, message: 'Upload failed' })
  }
})
