import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type { FlatCategory } from '~/composables/categories/buildCategoryTree'

function renderCategoryTree(categories: any[], linkStyle: string, depth = 0): string {
  return categories.map(c => {
    const slug = c.headlessName && c.headlessName !== false
      ? c.headlessName
      : c.name.toLowerCase()

    const paddingLeft = 16 + depth * 12

    if (c.children && c.children.length > 0) {
      return `<div class='rubikx-cat-parent' style='position:relative;'>
        <div style='display:flex;align-items:center;justify-content:space-between;padding:8px ${paddingLeft}px;cursor:pointer;' class='rubikx-cat-toggle'>
          <a href='/${slug}' style='color:#111;font-size:14px;text-decoration:none;flex:1;'>${c.displayName}</a>
          <span style='color:#999;font-size:10px;margin-left:8px;'>▶</span>
        </div>
        <div class='rubikx-cat-children' style='display:none;background:#f9f9f9;'>
          ${renderCategoryTree(c.children, linkStyle, depth + 1)}
        </div>
      </div>`
    }

    return `<a href='/${slug}' style='display:block;padding:8px ${paddingLeft}px;color:#111;font-size:14px;text-decoration:none;white-space:nowrap;'>${c.displayName}</a>`
  }).join('')
}

async function loadCategories(el: HTMLElement, companyId = 3) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const maxItems = parseInt(el.dataset.maxItems ?? '20')
  const linkColor = el.dataset.linkColor ?? '#000000'
  const fontSize = el.dataset.fontSize ?? '14'
  const fontWeight = el.dataset.fontWeight ?? '400'
  const linkStyle = `color:${linkColor};font-size:${fontSize}px;font-weight:${fontWeight};white-space:nowrap;text-decoration:none;`

  const dropdown = el.querySelector<HTMLElement>('div[style*="position:absolute"], div[style*="position: absolute"]')
  if (!dropdown) return

  if (!document.getElementById('rubikx-cat-styles')) {
    const style = document.createElement('style')
    style.id = 'rubikx-cat-styles'
    style.textContent = '.rubikx-cat-dropdown { display: none; } .rubikx-cat-nav:hover .rubikx-cat-dropdown { display: block !important; }'
    document.head.appendChild(style)
  }
  // Remove inline display style so CSS :hover can control visibility
  dropdown.style.display = ''
  dropdown.style.removeProperty('display')

  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', { query: { companyId } })
    const tree = buildCategoryTree(flat).slice(0, maxItems)

    dropdown.innerHTML = renderCategoryTree(tree, linkStyle)

    // Wire parent toggle clicks for children
    dropdown.querySelectorAll<HTMLElement>('.rubikx-cat-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const parent = toggle.closest<HTMLElement>('.rubikx-cat-parent')
        const children = parent?.querySelector<HTMLElement>('.rubikx-cat-children')
        const arrow = toggle.querySelector<HTMLElement>('span')
        if (!children) return
        const isOpen = children.style.display !== 'none'
        children.style.display = isOpen ? 'none' : 'block'
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼'
      })
    })
  } catch (e) {
    console.error('[Rubikx] Failed to load categories:', e)
    if (dropdown) dropdown.innerHTML = ''
  }
}

const HANDLERS: Record<string, (el: HTMLElement, companyId?: number) => void> = {
  loadCategories,
}

export function hydrateComponents(companyId = 3) {
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
