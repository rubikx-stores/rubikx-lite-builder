import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type {
  FlatCategory,
  CategoryNode,
} from '~/composables/categories/buildCategoryTree'
import { icon } from '~/composables/useIconSvg'

// Set true to preview logged-in auth state inside the builder
const SIMULATE_AUTH = false

function renderCategoryTree(
  categories: CategoryNode[],
  linkStyle: string,
  depth = 0
): string {
  return categories
    .map((cat) => {
      const slug =
        cat.headlessName ?? cat.name.toLowerCase().replace(/\s+/g, '-')
      const label = cat.displayName.includes(' / ')
        ? cat.displayName.split(' / ').pop()!
        : cat.displayName
      if (!cat.children || cat.children.length === 0) {
        return `<a href='/${slug}' style='display:block;padding:6px ${16 + depth * 12}px;${linkStyle}text-decoration:none;'>${label}</a>`
      }
      return `<div style='padding:4px 0;'>
      <a href='/${slug}' style='display:block;padding:6px 16px;${linkStyle}text-decoration:none;font-weight:600;'>${label}</a>
      <div style='padding-left:8px;border-left:2px solid #f0f0f0;margin:2px 16px;'>
        ${renderCategoryTree(cat.children, linkStyle, depth + 1)}
      </div>
    </div>`
    })
    .join('')
}

async function loadCategories(el: HTMLElement, companyId = 3) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const maxItems = parseInt(el.dataset.maxItems ?? '20')
  const linkColor = el.dataset.linkColor ?? '#000000'
  const fontSize = el.dataset.fontSize ?? '14'
  const fontWeight = el.dataset.fontWeight ?? '400'
  const linkStyle = `color:${linkColor};font-size:${fontSize}px;font-weight:${fontWeight};white-space:nowrap;`

  const dropdown = el.querySelector<HTMLElement>(
    'div[style*="position:absolute"], div[style*="position: absolute"]'
  )
  if (!dropdown) return

  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId },
    })
    const tree = buildCategoryTree(flat).slice(0, maxItems)

    if (tree.length > 6) {
      // Mega menu — horizontal grid layout
      el.setAttribute('data-mega', 'true')
      dropdown.innerHTML = tree
        .map((cat) => {
          const slug =
            cat.headlessName ?? cat.name.toLowerCase().replace(/\s+/g, '-')
          const childrenHtml = (cat.children ?? [])
            .map((child) => {
              const childSlug =
                child.headlessName ??
                child.name.toLowerCase().replace(/\s+/g, '-')
              const childLabel = child.displayName.includes(' / ')
                ? child.displayName.split(' / ').pop()!
                : child.displayName
              return `<div class='rubikx-mega-child'><a href='/${childSlug}'>${childLabel}</a></div>`
            })
            .join('')
          return `<div>
          <div class='rubikx-mega-header'><a href='/${slug}'>${cat.displayName}</a></div>
          ${childrenHtml}
        </div>`
        })
        .join('')
    } else {
      // Simple vertical dropdown — always expanded
      el.removeAttribute('data-mega')
      dropdown.innerHTML = renderCategoryTree(tree, linkStyle)
      dropdown
        .querySelectorAll<HTMLElement>('.rubikx-cat-children')
        .forEach((el) => {
          el.style.display = 'block'
        })
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
      dots[cur].style.background =
        dots[cur].dataset.inactiveColor ?? 'rgba(255,255,255,0.5)'
    }
    cur = (n + slides.length) % slides.length
    slides[cur].style.opacity = '1'
    slides[cur].style.pointerEvents = 'auto'
    if (dots[cur]) {
      dots[cur].style.width = '24px'
      dots[cur].style.background = dots[cur].dataset.activeColor ?? '#ffffff'
    }
  }

  function startTimer() {
    if (autoPlay) timer = setInterval(() => goTo(cur + 1), interval)
  }
  function stopTimer() {
    if (timer) clearInterval(timer)
  }

  if (prevBtn)
    prevBtn.addEventListener('click', () => {
      stopTimer()
      goTo(cur - 1)
      startTimer()
    })
  if (nextBtn)
    nextBtn.addEventListener('click', () => {
      stopTimer()
      goTo(cur + 1)
      startTimer()
    })
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      stopTimer()
      goTo(i)
      startTimer()
    })
  )
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
    badge.style.cssText =
      'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none;'
    el.appendChild(badge)
  }
}

async function loadAuthState(el: HTMLElement, companyId?: number) {
  const inBuilder = !!document.getElementById('page-builder-wrapper')
  if (inBuilder && !SIMULATE_AUTH) return
  const profileUrl = el.dataset.profileUrl ?? '/me/personal'

  // New layout: querySelectorAll covers both desktop + mobile drawer Sign In buttons
  // Old layout (backwards compat): Sign In link is a child <a> inside the shell itself
  const externalSignInBtns = Array.from(
    document.querySelectorAll<HTMLElement>('[data-auth-signin-btn]')
  )
  const internalSignInLink = el.querySelector<HTMLElement>('a')
  const isNewLayout = externalSignInBtns.length > 0
  const signInEls: HTMLElement[] = isNewLayout
    ? externalSignInBtns
    : internalSignInLink
      ? [internalSignInLink]
      : []

  try {
    let userName = ''
    if (SIMULATE_AUTH) {
      userName = 'Demo User'
    } else {
      const res = await $fetch<{ user: { name: string; email: string } }>(
        '/api/auth/me'
      )
      userName = res.user?.name ?? ''
    }

    signInEls.forEach((btn) => {
      btn.style.display = 'none'
    })
    el.style.display = 'inline-flex'

    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()

    const initials = userName
      ? userName
          .trim()
          .split(/\s+/)
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : ''

    const profileBtn = document.createElement('button')
    profileBtn.setAttribute('data-auth-profile', 'true')
    profileBtn.style.cssText =
      'background:none;border:none;cursor:pointer;display:flex;align-items:center;padding:0;'

    const avatar = document.createElement('div')
    avatar.style.cssText =
      'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'
    if (initials) {
      avatar.style.cssText +=
        'background:#6366f1;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.025em;'
      avatar.textContent = initials
    } else {
      avatar.style.cssText += 'background:#e5e7eb;'
      avatar.innerHTML = icon('user', { size: 20, style: 'flex-shrink:0;' })
    }
    profileBtn.appendChild(avatar)

    const dropdown = document.createElement('div')
    dropdown.setAttribute('data-auth-dropdown', 'true')
    dropdown.style.cssText =
      'display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);min-width:160px;z-index:9999;padding:4px 0;'

    const profileLink = document.createElement('a')
    profileLink.setAttribute('href', profileUrl)
    profileLink.textContent = 'Your Profile'
    profileLink.style.cssText =
      'display:block;padding:10px 16px;font-size:14px;color:#111827;text-decoration:none;white-space:nowrap;'

    const signOutLink = document.createElement('a')
    signOutLink.setAttribute('href', '/logout')
    signOutLink.textContent = 'Sign out'
    signOutLink.style.cssText =
      'display:block;padding:10px 16px;font-size:14px;color:#ef4444;text-decoration:none;white-space:nowrap;'

    dropdown.appendChild(profileLink)
    dropdown.appendChild(signOutLink)

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = dropdown.style.display === 'block'
      dropdown.style.display = isOpen ? 'none' : 'block'
    })

    document.addEventListener(
      'click',
      () => {
        dropdown.style.display = 'none'
      },
      { once: false }
    )

    el.appendChild(profileBtn)
    el.appendChild(dropdown)
  } catch {
    signInEls.forEach((btn) => {
      btn.style.display = ''
    })
    if (isNewLayout) el.style.display = 'none'
    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()
  }
}

async function loadProductDetail(el: HTMLElement, companyId = 3) {
  if (document.getElementById('page-builder-wrapper')) return
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const productIds = (el.dataset.productIds ?? '').trim()
  const accentColor = el.dataset.accentColor || '#1a56db'
  const curr = el.dataset.currency || '$'
  const productNameColor = el.dataset.productNameColor || '#111827'
  const productNameWeight = el.dataset.productNameWeight || '700'
  const productNameSize = el.dataset.productNameSize || '22'
  const priceModifierColor = el.dataset.priceModifierColor || '#6b7280'
  const priceModifierWeight = el.dataset.priceModifierWeight || '400'
  const priceModifierSize = el.dataset.priceModifierSize || '10'
  const thumbSize = parseInt(el.dataset.thumbSize || '64', 10)
  const thumbRadius = parseInt(el.dataset.thumbRadius || '4', 10)

  const thumbsWrap = el.querySelector<HTMLElement>('[data-rb-pd-thumbs]')
  const mainImgWrap = el.querySelector<HTMLElement>('[data-rb-pd-main-img]')
  const nameEl = el.querySelector<HTMLElement>('[data-rb-pd-name]')
  const colorsEl = el.querySelector<HTMLElement>('[data-rb-pd-colors]')
  const priceEl = el.querySelector<HTMLElement>('[data-rb-pd-price]')
  const totalEl = el.querySelector<HTMLElement>('[data-rb-pd-total]')
  const tablePriceEl = el.querySelector<HTMLElement>('[data-rb-pd-table-price]')

  try {
    const query: Record<string, string | number> = { companyId }
    if (productIds) query.ids = productIds

    const products = await $fetch<any[]>('/api/products', { query })
    if (!products || products.length === 0) return

    // Build thumbnail strip from all fetched products
    if (thumbsWrap) {
      thumbsWrap.innerHTML = products.map((p, i) =>
        `<div data-rb-pd-thumb="${i}" style="width:${thumbSize}px;height:${thumbSize}px;border:2px solid ${i === 0 ? accentColor : '#e5e7eb'};border-radius:${thumbRadius}px;overflow:hidden;cursor:pointer;flex-shrink:0;box-sizing:border-box;background:#fff;">
          ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;display:block;" />` : ''}
        </div>`
      ).join('')
    }

    function showProduct(p: any, idx: number) {
      // Main image
      if (mainImgWrap) {
        mainImgWrap.style.background = '#fff'
        mainImgWrap.innerHTML = p.image
          ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;display:block;" />`
          : ''
      }
      // Name
      if (nameEl) {
        nameEl.textContent = p.name
        nameEl.style.color = productNameColor
        nameEl.style.fontWeight = productNameWeight
        nameEl.style.fontSize = `${productNameSize}px`
      }
      // Colors
      if (colorsEl) {
        colorsEl.innerHTML = Array.isArray(p.colors) && p.colors.length
          ? p.colors.map((c: any, i: number) =>
              `<div style="display:inline-flex;align-items:center;gap:6px;border:${i === 0 ? `2px solid ${accentColor}` : '1px solid #d1d5db'};border-radius:9999px;padding:4px 12px;cursor:pointer;white-space:nowrap;">
                <span style="width:12px;height:12px;border-radius:50%;background:${c.htmlColor};border:1px solid rgba(0,0,0,0.15);flex-shrink:0;display:inline-block;"></span>
                <span style="font-size:11px;font-weight:700;color:#374151;letter-spacing:0.04em;">${c.name}</span>
              </div>`
            ).join('')
          : ''
      }
      // Prices
      const priceNum = Number(p.price)
      const priceStr = `${curr}${priceNum.toFixed(2)}`
      if (priceEl) priceEl.textContent = priceStr
      if (totalEl) totalEl.textContent = `Total: ${priceStr}`
      if (tablePriceEl) tablePriceEl.textContent = `${curr} ${priceNum.toFixed(2)}`
      // Highlight active thumbnail
      if (thumbsWrap) {
        Array.from(thumbsWrap.querySelectorAll<HTMLElement>('[data-rb-pd-thumb]')).forEach((t, i) => {
          t.style.borderColor = i === idx ? accentColor : '#e5e7eb'
        })
      }
    }

    // Apply price modifier styles to all size modifier labels
    el.querySelectorAll<HTMLElement>('[data-rb-pd-size-pm]').forEach(pm => {
      pm.style.color = priceModifierColor
      pm.style.fontWeight = priceModifierWeight
      pm.style.fontSize = `${priceModifierSize}px`
    })

    // Show first product immediately
    showProduct(products[0], 0)

    // Wire thumbnail clicks
    if (thumbsWrap) {
      Array.from(thumbsWrap.querySelectorAll<HTMLElement>('[data-rb-pd-thumb]')).forEach((thumb, i) => {
        thumb.addEventListener('click', () => showProduct(products[i], i))
      })
    }

  } catch (e) {
    console.error('[Rubikx] Failed to load product detail:', e)
  }
}

async function loadProductDetail2(el: HTMLElement, companyId = 3) {
  if (document.getElementById('page-builder-wrapper')) return
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const productIds = (el.dataset.productIds ?? '').trim()
  const accentColor = el.dataset.accentColor || '#4f46e5'
  const curr = el.dataset.currency || '$'
  const mainDiv = el.querySelector<HTMLElement>('[data-rb-pd2-main]')
  const thumbsGrid = el.querySelector<HTMLElement>('[data-rb-pd2-thumbs]')
  const nameEl = el.querySelector<HTMLElement>('[data-rb-pd2-name]')
  const priceEl = el.querySelector<HTMLElement>('[data-rb-pd2-price]')
  const descEl = el.querySelector<HTMLElement>('[data-rb-pd2-desc]')
  const colorsEl = el.querySelector<HTMLElement>('[data-rb-pd2-colors]')


  try {
    const query: Record<string, string | number> = { companyId }
    if (productIds) query.ids = productIds

    const products = await $fetch<any[]>('/api/products', { query })
    if (!products || products.length === 0) return
    const main = products[0]

    // Collect all images: main + extra thumbnails from product list
    const allImages: string[] = []
    if (main.image) allImages.push(main.image)
    products.slice(1, 4).forEach((p: any) => { if (p.image) allImages.push(p.image) })
    while (allImages.length < 4 && allImages.length > 0) allImages.push(allImages[0])

    function showImage(src: string, idx: number) {
      if (mainDiv) {
        mainDiv.style.background = '#ffffff'
        mainDiv.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:contain;display:block;" />`
      }
      if (thumbsGrid) {
        Array.from(thumbsGrid.querySelectorAll<HTMLElement>('[data-rb-pd2-thumb]')).forEach((t, i) => {
          t.style.borderColor = i === idx ? accentColor : '#e5e7eb'
        })
      }
    }

    // Main image
    if (mainDiv && allImages[0]) {
      mainDiv.style.background = '#ffffff'
      mainDiv.innerHTML = `<img src="${allImages[0]}" style="width:100%;height:100%;object-fit:contain;display:block;" />`
    }

    // Thumbnails
    if (thumbsGrid && allImages.length) {
      thumbsGrid.innerHTML = allImages.map((src, i) =>
        `<div data-rb-pd2-thumb="${i}" style="border:2px solid ${i === 0 ? accentColor : '#e5e7eb'};border-radius:6px;overflow:hidden;cursor:pointer;background:#fff;aspect-ratio:1;display:flex;align-items:center;justify-content:center;">
          <img src="${src}" style="width:100%;height:100%;object-fit:contain;display:block;" />
        </div>`
      ).join('')
      Array.from(thumbsGrid.querySelectorAll<HTMLElement>('[data-rb-pd2-thumb]')).forEach((t, i) => {
        t.addEventListener('click', () => showImage(allImages[i], i))
      })
    }

    // Name
    if (nameEl) nameEl.textContent = main.name ?? ''

    // Price
    const priceNum = Number(main.price)
    if (priceEl) priceEl.textContent = `${curr}${priceNum.toFixed(2)}`

    // Description (HTML or plain text)
    if (descEl) {
      const desc = (main as any).description ?? (main as any).description_sale ?? ''
      descEl.innerHTML = desc
        ? desc.startsWith('<')
          ? desc
          : desc.split('\n').filter(Boolean).map((l: string) => `<p style="margin:0 0 8px;">${l}</p>`).join('')
        : ''
    }

    // Color swatches
    if (colorsEl) {
      colorsEl.innerHTML = Array.isArray(main.colors) && main.colors.length
        ? main.colors.map((c: any, i: number) =>
            `<label style="display:inline-flex;align-items:center;gap:0;cursor:pointer;">
              <input type="radio" name="rb-pd2-color" value="${c.name}" style="display:none;" ${i === 0 ? 'checked' : ''} />
              <span title="${c.name}" style="display:block;width:28px;height:28px;border-radius:50%;background:${c.htmlColor};border:${i === 0 ? `3px solid ${accentColor}` : '2px solid #d1d5db'};box-sizing:border-box;transition:border-color 0.15s;"></span>
            </label>`
          ).join('')
        : ''
      colorsEl.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio, i) => {
        radio.addEventListener('change', () => {
          colorsEl.querySelectorAll<HTMLElement>('label span').forEach((s, j) => {
            s.style.border = j === i ? `3px solid ${accentColor}` : '2px solid #d1d5db'
          })
        })
      })
    }

    // Wire accordion
    el.querySelectorAll<HTMLElement>('[data-rb-pd2-acc-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.nextElementSibling as HTMLElement | null
        if (!panel) return
        const isOpen = panel.style.display !== 'none'
        panel.style.display = isOpen ? 'none' : 'block'
        const arrow = btn.querySelector<HTMLElement>('[data-rb-pd2-arrow]')
        if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'
      })
    })

  } catch (e) {
    console.error('[Rubikx] Failed to load product detail 2:', e)
  }
}

function loadMobileNav(el: HTMLElement) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const nav = el.closest('nav') || el.closest('section')
  if (!nav) return

  // Clean up any drawer/overlay left by a previous hydration run (e.g. builder re-render)
  document
    .querySelectorAll('[data-rb-nav-drawer-live]')
    .forEach((n) => n.remove())
  document
    .querySelectorAll('[data-rb-nav-overlay-live]')
    .forEach((n) => n.remove())

  // Hide the static in-nav copies — position:fixed inside the builder's overflow:scroll
  // container is clipped, so we re-create both appended to document.body instead.
  const staticDrawer = nav.querySelector<HTMLElement>('[data-mobile-drawer]')
  const staticOverlay = nav.querySelector<HTMLElement>('[data-mobile-overlay]')
  if (staticDrawer) staticDrawer.style.display = 'none'
  if (staticOverlay) staticOverlay.style.display = 'none'

  // Overlay — all styles set via JS so Odoo stripping inline CSS doesn't matter
  const overlay = document.createElement('div')
  overlay.setAttribute('data-rb-nav-overlay-live', 'true')
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;'
  document.body.appendChild(overlay)

  // Drawer — content copied from the static drawer, position:fixed set via JS
  const drawer = document.createElement('div')
  drawer.setAttribute('data-rb-nav-drawer-live', 'true')
  drawer.style.cssText =
    'position:fixed;top:0;left:-320px;width:320px;max-width:85vw;height:100vh;background:#fff;z-index:99999;transition:left 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.15);overflow-y:auto;padding:1.5rem;'
  if (staticDrawer) drawer.innerHTML = staticDrawer.innerHTML
  document.body.appendChild(drawer)

  const closeBtn = drawer.querySelector<HTMLElement>('[data-mobile-close]')

  function openDrawer() {
    drawer.style.left = '0'
    overlay.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    drawer.style.left = '-320px'
    overlay.style.display = 'none'
    document.body.style.overflow = ''
  }

  el.addEventListener('click', openDrawer)
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer)
  overlay.addEventListener('click', closeDrawer)
}

const HANDLERS: Record<string, (el: HTMLElement, companyId?: number) => void> =
  {
    loadCategories,
    loadSlider,
    loadCartCount,
    loadAuthState,
    loadMobileNav,
    loadProductDetail,
    loadProductDetail2,
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
  document
    .querySelectorAll<HTMLElement>('[data-rubikx-component]')
    .forEach((el) => {
      const onMount = el.dataset.onMount
      if (!onMount) return
      const handler = HANDLERS[onMount]
      if (!handler) {
        console.warn(`[Rubikx] No handler registered for: ${onMount}`)
        return
      }
      handler(el, companyId)
    })

  // Watch for dynamically added components (HeroSlider, CartBadge).
  // Fires the moment any matching element lands in the DOM — handles builder
  // re-renders (innerHTML swap) without relying on timing or nextTick.
  if (!(window as any).__rbxSliderObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement

          // HeroSlider
          if (el.dataset?.rubikxComponent === 'HeroSlider') {
            loadSlider(el)
          } else {
            el.querySelectorAll?.('[data-rubikx-component="HeroSlider"]').forEach((child) => {
              loadSlider(child as HTMLElement)
            })
          }

          // CartBadge — re-inject badge whenever the shell re-enters the DOM
          if (el.dataset?.rubikxComponent === 'CartBadge') {
            loadCartCount(el)
          } else {
            el.querySelectorAll?.('[data-rubikx-component="CartBadge"]').forEach((child) => {
              loadCartCount(child as HTMLElement)
            })
          }
          // Check children of added node
          el.querySelectorAll?.('[data-rubikx-component="HeroSlider"]').forEach(
            (child) => {
              loadSlider(child as HTMLElement)
            }
          )
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
