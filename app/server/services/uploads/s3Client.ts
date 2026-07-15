import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export interface S3Config {
  region: string
  bucketName: string
  cdnUrl: string
  accessKeyId?: string
  secretAccessKey?: string
}

export interface BuildKeyParams {
  folder: string
  companyId?: number | string
  contentHash: string
  fileName: string
}

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-100)
}

// Content-derived key: identical bytes uploaded twice land on the same S3
// object regardless of which field/block they came from, so the caller's
// LRU cache / single-flight map can dedupe them without risking collisions
// between unrelated fields that happen to share a field name (e.g. imageUrl).
export function buildKey({ folder, companyId, contentHash, fileName }: BuildKeyParams): string {
  return `${folder}/${companyId ?? 'shared'}/${contentHash}-${sanitizeFileName(fileName)}`
}

export async function uploadImage(cfg: S3Config, key: string, buffer: Buffer, contentType: string): Promise<string> {
  const client = new S3Client({
    region: cfg.region,
    ...(cfg.accessKeyId && cfg.secretAccessKey
      ? { credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey } }
      : {}),
  })

  await client.send(new PutObjectCommand({ Bucket: cfg.bucketName, Key: key, Body: buffer, ContentType: contentType }))

  const cdnBase = cfg.cdnUrl.replace(/\/+$/, '')
  return `${cdnBase}/${key}`
}
