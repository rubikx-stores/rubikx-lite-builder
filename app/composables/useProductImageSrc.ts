export function productImageSrc(image: string | null | undefined | false): string {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) return image
  const mime = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  return `data:${mime};base64,${image}`
}
