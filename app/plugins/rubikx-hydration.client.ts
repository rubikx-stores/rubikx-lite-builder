import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type { FlatCategory, CategoryNode } from '~/composables/categories/buildCategoryTree'
import { icon } from '~/composables/useIconSvg'

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
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

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

function loadSlider(el: HTMLElement) {
  const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'))
  const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'))
  const prevBtn = el.querySelector<HTMLElement>('[data-prev]')
  const nextBtn = el.querySelector<HTMLElement>('[data-next]')
  const autoPlay = el.dataset.autoplay === 'true'
  const interval = parseInt(el.dataset.interval ?? '4000')

  if (!slides.length) return

  let cur = 0
  let timer: ReturnType<typeof setInterval> | null = null

  function goTo(n: number) {
    slides[cur].style.opacity = '0'
    slides[cur].style.pointerEvents = 'none'
    if (dots[cur]) {
      dots[cur].style.width = '8px'
      dots[cur].style.background = dots[cur].dataset.inactiveColor ?? 'rgba(255,255,255,0.5)'
    }
    cur = (n + slides.length) % slides.length
    slides[cur].style.opacity = '1'
    slides[cur].style.pointerEvents = 'auto'
    if (dots[cur]) {
      dots[cur].style.width = '24px'
      dots[cur].style.background = dots[cur].dataset.activeColor ?? '#ffffff'
    }
  }

  function startTimer() { if (autoPlay) timer = setInterval(() => goTo(cur + 1), interval) }
  function stopTimer() { if (timer) clearInterval(timer) }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopTimer(); goTo(cur - 1); startTimer() })
  if (nextBtn) nextBtn.addEventListener('click', () => { stopTimer(); goTo(cur + 1); startTimer() })
  dots.forEach((d, i) => d.addEventListener('click', () => { stopTimer(); goTo(i); startTimer() }))
  el.addEventListener('mouseenter', stopTimer)
  el.addEventListener('mouseleave', startTimer)

  startTimer()
}

async function loadCartCount(el: HTMLElement, companyId?: number) {
  // TODO: replace with real Odoo cart API call on live storefront
  // Demo: hardcoded count for local testing
  const count = 3

  // Remove existing badge if any
  const existing = el.querySelector('[data-cart-badge]')
  if (existing) existing.remove()

  if (count > 0) {
    const badge = document.createElement('span')
    badge.setAttribute('data-cart-badge', 'true')
    badge.textContent = String(count)
    badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none;'
    el.appendChild(badge)
  }
}

async function loadAuthState(el: HTMLElement, companyId?: number) {
  if (document.getElementById('page-builder-wrapper')) return
  const signInUrl = el.dataset.signInUrl ?? '/login'
  const signInLabel = el.dataset.signInLabel ?? 'Sign In'
  const profileUrl = el.dataset.profileUrl ?? '/me/personal'
  const linkStyle = el.dataset.linkStyle ?? 'color:#111827;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap;'

  const signInLink = el.querySelector<HTMLElement>('a')

  try {
    const data = await $fetch<{ user: { name: string; email: string } }>('/api/auth/me')
    const user = data.user

    // User is logged in — hide sign in link, inject profile button + dropdown
    if (signInLink) signInLink.style.display = 'none'

    // Remove existing injected elements if re-running
    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()

    // Profile button
    const profileBtn = document.createElement('button')
    profileBtn.setAttribute('data-auth-profile', 'true')
    profileBtn.style.cssText = 'background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;'
    profileBtn.innerHTML = icon('user', { size: 24, style: 'flex-shrink:0;' })

    // Dropdown
    const dropdown = document.createElement('div')
    dropdown.setAttribute('data-auth-dropdown', 'true')
    dropdown.style.cssText = 'display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);min-width:160px;z-index:9999;padding:4px 0;'
    dropdown.innerHTML = `
      <a href="${profileUrl}" style="display:block;padding:10px 16px;font-size:14px;color:#111827;text-decoration:none;white-space:nowrap;">My Profile</a>
      <a href="/logout" style="display:block;padding:10px 16px;font-size:14px;color:#ef4444;text-decoration:none;white-space:nowrap;">Sign Out</a>
    `

    // Toggle dropdown on click
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = dropdown.style.display === 'block'
      dropdown.style.display = isOpen ? 'none' : 'block'
    })

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      dropdown.style.display = 'none'
    }, { once: false })

    el.appendChild(profileBtn)
    el.appendChild(dropdown)

  } catch {
    // User is not logged in — show sign in link as normal
    if (signInLink) signInLink.style.display = ''
    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()
  }
}

const HANDLERS: Record<string, (el: HTMLElement, companyId?: number) => void> = {
  loadCategories,
  loadSlider,
  loadCartCount,
  loadAuthState,
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

  // Global delegation for mobile nav — works regardless of when HTML is in the DOM
  if (!(window as any).__rbxNavDelegation) {
    ;(window as any).__rbxNavDelegation = true

    let rbxDrawer: HTMLElement | null = null
    let rbxOverlay: HTMLElement | null = null

    function closeMobileNav() {
      if (rbxDrawer) rbxDrawer.style.left = '-320px'
      if (rbxOverlay) rbxOverlay.style.display = 'none'
      document.body.style.overflow = ''
    }

    document.addEventListener('click', (e) => {
      const t = e.target as HTMLElement

      // Hamburger open button
      if (t.closest('[data-rb-nav-open]')) {
        if (!rbxDrawer) {
          const btn = t.closest<HTMLElement>('[data-rb-nav-open]')!
          const nav = btn.closest('nav') || btn.closest('section')
          const src = nav?.querySelector<HTMLElement>('[data-mobile-drawer]')

          rbxOverlay = document.createElement('div')
          rbxOverlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;'
          rbxOverlay.addEventListener('click', closeMobileNav)
          document.body.appendChild(rbxOverlay)

          rbxDrawer = document.createElement('div')
          rbxDrawer.style.cssText = 'position:fixed;top:0;left:-320px;width:320px;max-width:85vw;height:100vh;background:#fff;z-index:99999;transition:left 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.15);overflow-y:auto;padding:1.5rem;'
          if (src) rbxDrawer.innerHTML = src.innerHTML
          document.body.appendChild(rbxDrawer)

          // Hide the static in-nav drawer (clipped by builder overflow container)
          if (src) src.style.display = 'none'
          const staticOverlay = nav?.querySelector<HTMLElement>('[data-mobile-overlay]')
          if (staticOverlay) staticOverlay.style.display = 'none'
        }

        rbxDrawer.style.left = '0'
        rbxOverlay!.style.display = 'block'
        document.body.style.overflow = 'hidden'
        return
      }

      // Close button inside drawer or static drawer
      if (t.closest('[data-mobile-close]')) {
        closeMobileNav()
      }
    })
  }

  // Watch for dynamically added slider elements
  if (!(window as any).__rbxSliderObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          // Check if the added node itself is a slider
          if (el.dataset?.rubikxComponent === 'HeroSlider') {
            loadSlider(el)
            return
          }
          // Check children of added node
          el.querySelectorAll?.('[data-rubikx-component="HeroSlider"]').forEach((child) => {
            loadSlider(child as HTMLElement)
          })
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    ;(window as any).__rbxSliderObserver = observer
  }
}

export default defineNuxtPlugin(() => {
  hydrateComponents()
})
