import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type { FlatCategory, CategoryNode } from '~/composables/categories/buildCategoryTree'

function renderCategoryTree(categories: CategoryNode[], linkStyle: string, depth = 0): string {
  return categories.map(cat => {
    const slug = cat.headlessName ?? cat.name.toLowerCase().replace(/\s+/g, '-')
    const label = cat.displayName.includes(' / ') ? cat.displayName.split(' / ').pop()! : cat.displayName
    if (!cat.children || cat.children.length === 0) {
      return `<a href='/${slug}' style='display:block;padding:6px ${16 + depth * 12}px;${linkStyle}text-decoration:none;'>${label}</a>`
    }
    return `<div style='padding:4px 0;'>
      <a href='/${slug}' style='display:block;padding:6px 16px;${linkStyle}text-decoration:none;font-weight:600;'>${label}</a>
      <div style='padding-left:8px;border-left:2px solid #f0f0f0;margin:2px 16px;'>
        ${renderCategoryTree(cat.children, linkStyle, depth + 1)}
      </div>
    </div>`
  }).join('')
}

async function loadCategories(el: HTMLElement, companyId = 3) {
  const maxItems = parseInt(el.dataset.maxItems ?? '20')
  const linkColor = el.dataset.linkColor ?? '#000000'
  const fontSize = el.dataset.fontSize ?? '14'
  const fontWeight = el.dataset.fontWeight ?? '400'
  const linkStyle = `color:${linkColor};font-size:${fontSize}px;font-weight:${fontWeight};white-space:nowrap;`

  const dropdown = el.querySelector<HTMLElement>('div[style*="position:absolute"], div[style*="position: absolute"]')
  if (!dropdown) return

  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', { query: { companyId } })
    const tree = buildCategoryTree(flat).slice(0, maxItems)

    if (tree.length > 6) {
      // Mega menu — horizontal grid layout
      el.setAttribute('data-mega', 'true')
      dropdown.innerHTML = tree.map(cat => {
        const slug = cat.headlessName ?? cat.name.toLowerCase().replace(/\s+/g, '-')
        const childrenHtml = (cat.children ?? []).map(child => {
          const childSlug = child.headlessName ?? child.name.toLowerCase().replace(/\s+/g, '-')
          const childLabel = child.displayName.includes(' / ') ? child.displayName.split(' / ').pop()! : child.displayName
          return `<div class='rubikx-mega-child'><a href='/${childSlug}'>${childLabel}</a></div>`
        }).join('')
        return `<div>
          <div class='rubikx-mega-header'><a href='/${slug}'>${cat.displayName}</a></div>
          ${childrenHtml}
        </div>`
      }).join('')
    } else {
      // Simple vertical dropdown — always expanded
      el.removeAttribute('data-mega')
      dropdown.innerHTML = renderCategoryTree(tree, linkStyle)
      dropdown.querySelectorAll<HTMLElement>('.rubikx-cat-children').forEach(el => { el.style.display = 'block' })
    }
  } catch (e) {
    console.error('[Rubikx] Failed to load categories:', e)
    if (dropdown) dropdown.innerHTML = ''
  }
}

const HANDLERS: Record<string, (el: HTMLElement, companyId?: number) => void> = {
  loadCategories,
}

export function hydrateComponents(companyId = 3) {
  if (!document.getElementById('rubikx-cat-styles')) {
    const style = document.createElement('style')
    style.id = 'rubikx-cat-styles'
    style.textContent = `
  [data-cat-nav]:hover [data-cat-dropdown] { display: flex !important; flex-wrap: wrap; min-width: 500px; padding: 12px; gap: 0; }
  [data-cat-nav] [data-cat-dropdown] > div { min-width: 150px; flex: 1 1 150px; padding: 4px 8px; }
  [data-cat-nav] [data-cat-dropdown] > a { display: block; min-width: 150px; flex: 1 1 150px; padding: 4px 8px; }
  [data-cat-nav] [data-cat-dropdown] a { text-decoration: none; color: #111; font-size: 13px; }
  [data-cat-nav] [data-cat-dropdown] a:hover { color: #000; opacity: 0.7; }
  [data-cat-nav] [data-cat-dropdown] > div > a { font-weight: 600; font-size: 13px; padding: 4px 8px 2px; display: block; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
  [data-cat-nav] [data-cat-dropdown] > div > div a { font-size: 12px; color: #555; padding: 2px 8px; display: block; }
`
    document.head.appendChild(style)
  }
  document.querySelectorAll<HTMLElement>('[data-rubikx-component]').forEach(el => {
    const onMount = el.dataset.onMount
    if (!onMount) return
    const handler = HANDLERS[onMount]
    if (!handler) {
      console.warn(`[Rubikx] No handler registered for: ${onMount}`)
      return
    }
    handler(el, companyId)
  })
}

export default defineNuxtPlugin(() => {
  hydrateComponents()
})
