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

async function loadCategories(el: HTMLElement, companyId?: number) {
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
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

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
  const count = 0

  // Remove existing badge if any
  const existing = el.querySelector('[data-cart-badge]')
  if (existing) existing.remove()

  const badge = document.createElement('span')
  badge.setAttribute('data-cart-badge', 'true')
  badge.textContent = String(count)
  badge.style.cssText =
    'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none;'
  el.appendChild(badge)
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

  // Drawer — uses transform for show/hide so a CSS transform on an Odoo ancestor
  // element cannot break positioning (position:fixed containing block issue).
  const drawer = document.createElement('div')
  drawer.setAttribute('data-rb-nav-drawer-live', 'true')
  drawer.style.cssText =
    'position:fixed;top:0;left:0;width:320px;max-width:85vw;height:100vh;background:#fff;z-index:99999;transform:translateX(-100%);transition:transform 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.15);overflow-y:auto;padding:1.5rem;'
  if (staticDrawer) drawer.innerHTML = staticDrawer.innerHTML
  document.body.appendChild(drawer)

  const closeBtn = drawer.querySelector<HTMLElement>('[data-mobile-close]')

  function openDrawer() {
    drawer.style.transform = 'translateX(0)'
    overlay.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    drawer.style.transform = 'translateX(-100%)'
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
  }

// Tracks the companyId passed to the most recent hydrateComponents() call so
// the MutationObserver below (which lives for the page's lifetime) can hydrate
// late-arriving elements with the right context instead of a stale closure value.
let _lastCompanyId: number | undefined

function hydrateElement(el: HTMLElement, companyId?: number) {
  const onMount = el.dataset.onMount
  if (!onMount) return
  const handler = HANDLERS[onMount]
  if (!handler) {
    console.warn(`[Rubikx] No handler registered for: ${onMount}`)
    return
  }
  handler(el, companyId)
}

export function hydrateComponents(companyId?: number) {
  _lastCompanyId = companyId
  // Inject responsive navbar CSS for the live Odoo site (where main.css is not loaded).
  // main.css covers the builder; this covers the live site. Same selectors, same rules.
  if (!document.getElementById('rubikx-nav-styles')) {
    const s = document.createElement('style')
    s.id = 'rubikx-nav-styles'
    s.textContent = `
[data-nav-mobile]{display:none}
[data-nav-desktop]{display:grid}
@media(max-width:1024px){
  [data-nav-mobile]{display:flex!important}
  [data-nav-desktop]{display:none!important}
  [data-nav-desktop-lower]{display:none!important}
}`
    document.head.appendChild(s)
  }

  if (!document.getElementById('rubikx-stats-styles')) {
    const ss = document.createElement('style')
    ss.id = 'rubikx-stats-styles'
    ss.textContent = `
@media(max-width:768px){
  [data-ru1-stats-grid]{grid-template-columns:repeat(2,1fr)!important}
  [data-ru2-stats-grid]{grid-template-columns:repeat(2,1fr)!important;gap:20px!important}
  [data-ru2-stats-grid]>div{border-left:none!important}
  [data-ru4-stats-outer]{grid-template-columns:1fr!important}
  [data-ru3-stats-row]{flex-direction:column!important}
  [data-ru3-stats-sep]{display:none!important}
}
@media(max-width:480px){
  [data-ru1-stats-grid]{grid-template-columns:1fr!important;gap:12px!important}
  [data-ru2-stats-grid]{grid-template-columns:1fr!important;gap:0!important}
  [data-ru2-stats-grid]>div{border-top:1px solid rgba(0,0,0,0.08);padding-top:20px!important}
  [data-ru2-stats-grid]>div:first-child{border-top:none!important;padding-top:0!important}
  [data-ru4-stats-inner]{grid-template-columns:1fr!important}
}`
    document.head.appendChild(ss)
  }

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

  // This script only ever loads inside this admin app (builder/dashboard) —
  // the published page gets a bare HTML fragment and never runs it, so this
  // rule never applies there and the iframe stays fully interactive by
  // default. Here in the builder, the library never attaches click/select
  // listeners to <iframe> and it visually covers the div behind it, so
  // pointer-events:none lets that first click reach the div and select the
  // block. [selected] is the exact attribute the library sets on whatever
  // element you clicked — once selected, the iframe becomes interactive again
  // so the video is actually playable while you're editing it.
  if (!document.getElementById('rubikx-yt-styles')) {
    const yt = document.createElement('style')
    yt.id = 'rubikx-yt-styles'
    yt.textContent = `
  [data-rb-yt-frame] iframe { pointer-events: none; }
  [data-rb-yt-frame][selected] iframe { pointer-events: auto; }
`
    document.head.appendChild(yt)
  }
  document
    .querySelectorAll<HTMLElement>('[data-rubikx-component]')
    .forEach((el) => hydrateElement(el, companyId))

  // Watch for components whose markup lands in the DOM after this pass — the
  // builder's async render/insert (e.g. adding the first block to an empty
  // canvas) can land slightly later than the nextTick() callers await before
  // calling hydrateComponents(), which otherwise leaves that element's
  // data-on-mount handler (CartBadge, AuthState, CategoryNav, HeroSlider) never
  // invoked at all — no retry, so it silently never hydrates.
  if (!(window as any).__rbxHydrationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.dataset?.rubikxComponent) hydrateElement(el, _lastCompanyId)
          el.querySelectorAll?.<HTMLElement>('[data-rubikx-component]').forEach(
            (child) => hydrateElement(child, _lastCompanyId)
          )
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    ;(window as any).__rbxHydrationObserver = observer
  }
}

export default defineNuxtPlugin(() => {
  hydrateComponents()
})
