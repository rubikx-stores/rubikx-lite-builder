import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type {
  FlatCategory,
  CategoryNode,
} from '~/composables/categories/buildCategoryTree'
import { icon } from '~/composables/useIconSvg'
import { productImageSrc } from '~/composables/useProductImageSrc'
import { useBlockRegistry } from '~/composables/editor/useBlockRegistry'

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

async function loadProductDetail(el: HTMLElement, companyId = 3) {
  const isBuilder = !!document.getElementById('page-builder-wrapper')
  const layout = el.dataset.galleryLayout || 'layout1'

  // In the builder only Layout 3 needs JS wiring (carousel + auto-slide).
  if (isBuilder && layout !== 'layout3') return

  if (isBuilder) {
    // Builder: cancel any previous carousel on this element and restart fresh.
    // Do NOT use data-hydrated here — we want re-entry so that field edits and
    // DOM replacements (syncDomToStoreOnly) always get a fresh working carousel.
    const old = (el as any).__rbxPdTimer
    if (old) clearTimeout(old)
  } else {
    if (el.dataset.hydrated === 'true') return
    el.dataset.hydrated = 'true'
  }

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
  const thumbCount = parseInt(
    layout === 'layout3' ? (el.dataset.l3ThumbCount || '3')
    : layout === 'layout2' ? (el.dataset.l2ThumbCount || '2')
    : (el.dataset.l1ThumbCount || '1'),
    10
  )
  const autoSlideMs = (parseInt(el.dataset.l3AutoSlideSeconds || '3', 10)) * 1000

  const thumbsWrap = el.querySelector<HTMLElement>('[data-rb-pd-thumbs]')
  const mainImgWrap = el.querySelector<HTMLElement>('[data-rb-pd-main-img]')
  const nameEl = el.querySelector<HTMLElement>('[data-rb-pd-name]')
  const colorsEl = el.querySelector<HTMLElement>('[data-rb-pd-colors]')
  const priceEl = el.querySelector<HTMLElement>('[data-rb-pd-price]')
  const totalEl = el.querySelector<HTMLElement>('[data-rb-pd-total]')
  const tablePriceEl = el.querySelector<HTMLElement>('[data-rb-pd-table-price]')

  try {
    const skeletonThumbInner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="3"/>
        <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
      </svg>
    </div>`

    const skeletonMainImg = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="3"/>
        <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
      </svg>
    </div>`

    // Mutable slots — start as all-null (skeletons), filled once products resolve.
    // The auto-slide timer reads slots[i] on every fire, so product data appears
    // on the next slide after the fetch resolves — no timer restart needed.
    const slots: (any | null)[] = Array(thumbCount).fill(null)

    // ── Resolve products ────────────────────────────────────────────────────
    // Builder: try registry first (sync, no fetch). Fall back to API in background
    // AFTER the carousel is already running so sliding is always instant.
    // Non-builder: await the fetch here (blocking), then proceed.
    let builderNeedsFetch = false

    if (isBuilder) {
      const sectionEl = el.closest('[data-componentid]') as HTMLElement | null
      const compId = sectionEl?.getAttribute('data-componentid')
      const regData = compId ? useBlockRegistry().getData(compId) : null
      const thumbSrcs: string[] = Array.isArray(regData?.thumbImageSrcs) ? regData.thumbImageSrcs : []

      if (thumbSrcs.length > 0) {
        thumbSrcs.filter(src => !!src).slice(0, thumbCount).forEach((src, i) => {
          slots[i] = {
            image: src,
            name: i === 0 ? (regData?._productName ?? '') : '',
            price: i === 0 ? (regData?._productPriceNum ?? null) : null,
            colors: i === 0 ? (Array.isArray(regData?._productColors) ? regData._productColors : []) : [],
          }
        })
      } else if (productIds) {
        builderNeedsFetch = true  // kick off fetch AFTER carousel starts
      }
    } else {
      // Live page: blocking fetch fills slots before any UI is built
      const query: Record<string, string | number> = { companyId }
      if (productIds) query.ids = productIds
      const raw = await $fetch<any[]>('/api/products', { query }).catch(() => [] as any[])
      if (!document.contains(el)) return
      const fetched = (raw ?? []).map(p => ({ ...p, image: productImageSrc(p.image) }))
      fetched.slice(0, thumbCount).forEach((p, i) => { slots[i] = p })
    }

    // ── Build thumbnail strip ───────────────────────────────────────────────
    if (thumbsWrap) {
      thumbsWrap.innerHTML = slots.map((p, i) =>
        `<div data-rb-pd-thumb="${i}" style="width:${thumbSize}px;height:${thumbSize}px;border:2px solid ${i === 0 ? accentColor : '#e5e7eb'};border-radius:${thumbRadius}px;overflow:hidden;cursor:pointer;flex-shrink:0;box-sizing:border-box;background:#fff;">
          ${p?.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;display:block;" />` : skeletonThumbInner}
        </div>`
      ).join('')
    }

    let currentIdx = 0
    let autoSlideTimer: ReturnType<typeof setInterval> | null = null

    function updateDots(idx: number) {
      el.querySelectorAll<HTMLElement>('[data-rb-pd-dot]').forEach(dot => {
        dot.style.background = parseInt(dot.dataset.rbPdDot ?? '0', 10) === idx ? accentColor : '#d1d5db'
      })
    }

    function highlightThumb(idx: number) {
      if (!thumbsWrap) return
      thumbsWrap.querySelectorAll<HTMLElement>('[data-rb-pd-thumb]').forEach((t, i) => {
        t.style.borderColor = i === idx ? accentColor : '#e5e7eb'
      })
    }

    function showSlot(p: any | null, idx: number) {
      currentIdx = idx
      if (mainImgWrap) {
        mainImgWrap.style.background = '#fff'
        mainImgWrap.innerHTML = p?.image
          ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;display:block;" />`
          : skeletonMainImg
      }
      // Only update name/colors/price for real product slots — skeleton slides
      // keep the last real product's info frozen (only gallery image changes).
      if (p) {
        if (nameEl) {
          nameEl.textContent = p.name
          nameEl.style.color = productNameColor
          nameEl.style.fontWeight = productNameWeight
          nameEl.style.fontSize = `${productNameSize}px`
        }
        if (colorsEl) {
          colorsEl.innerHTML = Array.isArray(p.colors) && p.colors.length
            ? p.colors.map((c: any, i: number) =>
                `<div style="display:inline-flex;align-items:center;gap:6px;border:${i === 0 ? `2px solid ${accentColor}` : '1px solid #d1d5db'};border-radius:9999px;padding:4px 12px;cursor:pointer;white-space:nowrap;">
                  <span style="width:12px;height:12px;border-radius:50%;background:${c.htmlColor};border:1px solid rgba(0,0,0,0.15);flex-shrink:0;display:inline-block;"></span>
                  <span style="font-size:11px;font-weight:700;color:#374151;letter-spacing:0.04em;">${c.name}</span>
                </div>`
              ).join('')
            : '<div style="height:30px;background:#f3f4f6;border-radius:9999px;width:110px;"></div>'
        }
        const priceNum = Number(p.price)
        const priceStr = `${curr}${priceNum.toFixed(2)}`
        if (priceEl) priceEl.textContent = priceStr
        if (totalEl) totalEl.textContent = `Total: ${priceStr}`
        if (tablePriceEl) tablePriceEl.textContent = `${curr} ${priceNum.toFixed(2)}`
        // TODO: populate descEl with real product description when API query is ready
      }
      highlightThumb(idx)
      updateDots(idx)
    }

    el.querySelectorAll<HTMLElement>('[data-rb-pd-size-pm]').forEach(pm => {
      pm.style.color = priceModifierColor
      pm.style.fontWeight = priceModifierWeight
      pm.style.fontSize = `${priceModifierSize}px`
    })

    showSlot(slots[0], 0)

    // Wire thumbnail clicks
    if (thumbsWrap) {
      thumbsWrap.querySelectorAll<HTMLElement>('[data-rb-pd-thumb]').forEach((thumb, i) => {
        thumb.addEventListener('click', () => showSlot(slots[i] ?? null, i))
      })
    }

    // ── Layout 3: carousel controls + auto-slide ────────────────────────────
    if (layout === 'layout3') {
      const prevBtn = el.querySelector<HTMLElement>('[data-rb-pd-prev]')
      const nextBtn = el.querySelector<HTMLElement>('[data-rb-pd-next]')
      const thumbPrevBtn = el.querySelector<HTMLElement>('[data-rb-pd-thumb-prev]')
      const thumbNextBtn = el.querySelector<HTMLElement>('[data-rb-pd-thumb-next]')

      prevBtn?.addEventListener('click', () => {
        const next = (currentIdx - 1 + slots.length) % slots.length
        showSlot(slots[next] ?? null, next)
      })
      nextBtn?.addEventListener('click', () => {
        const next = (currentIdx + 1) % slots.length
        showSlot(slots[next] ?? null, next)
      })

      let thumbScrollOffset = 0
      const thumbItemH = thumbSize + 8
      const maxThumbScroll = Math.max(0, (slots.length - 1) * thumbItemH)

      thumbPrevBtn?.addEventListener('click', () => {
        thumbScrollOffset = Math.max(0, thumbScrollOffset - thumbItemH)
        if (thumbsWrap) thumbsWrap.style.transform = `translateY(-${thumbScrollOffset}px)`
      })
      thumbNextBtn?.addEventListener('click', () => {
        thumbScrollOffset = Math.min(maxThumbScroll, thumbScrollOffset + thumbItemH)
        if (thumbsWrap) thumbsWrap.style.transform = `translateY(-${thumbScrollOffset}px)`
      })

      el.querySelectorAll<HTMLElement>('[data-rb-pd-dot]').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.rbPdDot ?? '0', 10)
          showSlot(slots[idx] ?? null, idx)
        })
      })

      if (slots.length > 1 && autoSlideMs > 0) {
        if (isBuilder) {
          // Self-canceling chain — stops when el is replaced by a field edit.
          // Timer ref is stored on el so any re-entry (field edit, re-render)
          // cancels the previous chain before starting a new one.
          const slide = () => {
            if (!document.contains(el)) { delete (el as any).__rbxPdTimer; return }
            const next = (currentIdx + 1) % slots.length
            showSlot(slots[next] ?? null, next)
            ;(el as any).__rbxPdTimer = setTimeout(slide, autoSlideMs)
          }
          ;(el as any).__rbxPdTimer = setTimeout(slide, autoSlideMs)
        } else {
          autoSlideTimer = setInterval(() => {
            const next = (currentIdx + 1) % slots.length
            showSlot(slots[next] ?? null, next)
          }, autoSlideMs)
        }
      }
    }

    // ── Background fetch for builder (save+re-open) ─────────────────────────
    // Carousel is already running. Fill slots[] in-place — timer picks up
    // product images on the next slide without any restart.
    if (builderNeedsFetch) {
      $fetch<any[]>('/api/products', { query: { companyId, ids: productIds } })
        .catch(() => [] as any[])
        .then((raw: any[]) => {
          if (!document.contains(el)) return
          const products = (raw ?? []).map((p: any) => ({ ...p, image: productImageSrc(p.image) }))
          products.slice(0, thumbCount).forEach((p: any, i: number) => { slots[i] = p })
          if (thumbsWrap) {
            slots.forEach((p, i) => {
              const thumbEl = thumbsWrap.querySelector<HTMLElement>(`[data-rb-pd-thumb="${i}"]`)
              if (thumbEl && p?.image) {
                thumbEl.innerHTML = `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;display:block;" />`
              }
            })
          }
          showSlot(slots[currentIdx] ?? null, currentIdx)
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

export function hydrateComponents(companyId?: number) {
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

          // ProductDetail layout3 (builder only) — fires whenever a fresh layout3
          // element lands in the DOM, e.g. after builder library injects sections or
          // after _applyBlockRender swaps innerHTML. The data-hydrated guard inside
          // loadProductDetail prevents double-wiring on the same element.
          if (document.getElementById('page-builder-wrapper')) {
            if (el.dataset?.rubikxComponent === 'ProductDetail' && el.dataset?.galleryLayout === 'layout3') {
              loadProductDetail(el as HTMLElement)
            } else {
              el.querySelectorAll?.('[data-rubikx-component="ProductDetail"][data-gallery-layout="layout3"]').forEach((child) => {
                loadProductDetail(child as HTMLElement)
              })
            }
          }
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
