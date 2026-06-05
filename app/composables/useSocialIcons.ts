export function getDomain(href: string): string {
  try { return new URL(href).hostname.replace(/^www\./, '') } catch { return '' }
}

export function faviconUrl(href: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain=${getDomain(href)}`
}

export function socialIconHtml(href: string, size = 28): string {
  if (!href?.trim()) return ''
  const domain = getDomain(href)
  const label = domain || 'Link'
  return `<a href="${href}" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:#fff;border:1.5px solid #e5e7eb;overflow:hidden;text-decoration:none;flex-shrink:0;" aria-label="${label}" target="_blank" rel="noopener"><img src="${faviconUrl(href)}" width="${size}" height="${size}" style="object-fit:contain;" alt="${domain}" /></a>`
}
