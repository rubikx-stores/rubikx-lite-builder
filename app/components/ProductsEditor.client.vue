<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { sharedPageBuilderStore, getPageBuilder } from '@myissue/vue-website-page-builder'

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const pageBuilderStateStore = sharedPageBuilderStore
const pageBuilderService = getPageBuilder()

const products = ref([])
const loading = ref(false)
const errorMsg = ref('')
const search = ref('')
const selected = ref([])

const btnEnabled = ref(true)
const btnText = ref('Shop Now')
const btnBg = ref('#000000')
const btnColor = ref('#ffffff')

const bgColor = ref('#ffffff')
const bgImageUrl = ref('')
const bgImageError = ref('')

const cardBg = ref('#ffffff')
const cardTextColor = ref('#000000')
const cardFontSize = ref(14)
const cardBorderRadius = ref(0)
const cardShadow = ref('none')
const cardMargin = ref(0)
const cardPadding = ref(0)
const shadowPresets = {
  'none':       '0 0 #0000',
  'shadow-2xs': '0 1px rgb(0 0 0 / 0.05)',
  'shadow-xs':  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-sm':  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md':  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg':  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl':  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}

const component = computed(() => pageBuilderStateStore.getComponent)

const lastAppliedCompId = ref('')
const _lastResetForId = ref('')

const storedMode = ref('')
watch(component, (newComp) => {
  if (newComp?.title) {
    storedMode.value = newComp.title.includes('Single') ? 'single' : newComp.title.includes('6') ? 'six' : 'multiple'
    lastAppliedCompId.value = newComp.id
  }
  if (newComp?.id && newComp.id !== _lastResetForId.value) {
    _lastResetForId.value = newComp.id
    selected.value = []
    search.value = ''
    btnText.value = 'Shop Now'
    btnBg.value = '#000000'
    btnColor.value = '#ffffff'
    btnEnabled.value = true
    bgColor.value = '#ffffff'
    bgImageUrl.value = ''
    cardBg.value = '#ffffff'
    cardTextColor.value = '#000000'
    cardFontSize.value = 14
    cardBorderRadius.value = 0
    cardShadow.value = 'none'
    cardMargin.value = 0
    cardPadding.value = 0
  }
}, { immediate: true })
const mode = computed(() => storedMode.value || 'multiple')

const maxSelection = computed(() => mode.value === 'single' ? 1 : mode.value === 'six' ? 6 : 3)

const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter((p) => p.name?.toLowerCase().includes(q))
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/api/products')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    products.value = await res.json()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to load products'
  } finally {
    loading.value = false
  }
  // Hardcode placeholder values — don't read from DOM
  // because canvas might already have products applied
  const PLACEHOLDER_NAME = 'Layouts and visual.'
  const PLACEHOLDER_PRICE = 'Start customizing by editing this default text directly in the editor.'

  await nextTick()
  const section = getSection()

  // Pre-populate from stored data attribute
  const storedIds = section?.getAttribute(
    'data-selected-products'
  )
  if (storedIds) {
    try {
      const ids = JSON.parse(storedIds)
      selected.value = products.value.filter(
        p => ids.includes(p.id)
      )
    } catch (e) {
      // ignore parse errors
    }
  }
})

function getSection() {
  const id = component.value?.id ?? lastAppliedCompId.value
  if (!id) return null
  return document.querySelector(`section[data-componentid="${id}"]`)
}

function productImageSrc(image) {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) return image
  // Detect format from base64 magic bytes: /9j/ = JPEG, iVBOR = PNG
  const mime = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  return `data:${mime};base64,${image}`
}

function doApply() {
  const section = getSection()
  if (!section) return

  // Clean all cards first before rebuilding
  const allCards = section.querySelectorAll(
    '.flex-1, .pbx-flex-1'
  )
  allCards.forEach(card => {
    card.querySelectorAll('a.shop-btn').forEach(b => b.remove())
    card.querySelectorAll('.color-swatches').forEach(s => s.remove())
    const textDiv = card.querySelector(
      '.break-words, .pbx-break-words'
    )
    if (textDiv) {
      textDiv.style.display = ''
      textDiv.style.flexDirection = ''
    }
  })

  const cards = section.querySelectorAll('.flex-1, .pbx-flex-1')
  cards.forEach(card => {
    card.style.backgroundColor = cardBg.value
    card.style.color = cardTextColor.value
    card.style.fontSize = cardFontSize.value + 'px'
    card.style.borderRadius = cardBorderRadius.value + 'px'
    card.style.boxShadow = shadowPresets[cardShadow.value] ?? 'none'
    card.style.margin = cardMargin.value + 'px'
    card.style.padding = cardPadding.value + 'px'
  })

  const imgs = section.querySelectorAll('img[alt="provider"]')
  imgs.forEach((img, i) => {
    const product = selected.value[i]
    if (!product) return
    img.setAttribute('src', productImageSrc(product.image))
    const parentDiv = img.parentElement
    if (parentDiv) {
      const ps = parentDiv.querySelectorAll('p')
      if (ps[0]) ps[0].textContent = product.name ?? ''
      if (ps[1]) ps[1].textContent = product.price != null ? String(product.price) : ''

      // textContainer is the div that holds the <p> tags — button goes here too
      const textContainer = ps[0]?.parentElement ?? parentDiv
      // Nuke all existing buttons from the whole card before recreating
      const cardDiv = img.closest('.flex-1, .pbx-flex-1') ?? parentDiv
      const textDiv = cardDiv.querySelector('.break-words, .pbx-break-words') ?? textContainer
      textDiv.style.display = 'flex'
      textDiv.style.flexDirection = 'column'
      cardDiv.querySelectorAll('a.shop-btn').forEach(b => b.remove())

      // Remove existing swatches
      const existingSwatches = textDiv?.querySelector('.color-swatches')
      if (existingSwatches) existingSwatches.remove()

      // Add new swatches if product has colors
      if (product.colors?.length) {
        const swatchContainer = document.createElement('div')
        swatchContainer.className = 'color-swatches'
        swatchContainer.style.cssText = 'display:flex; gap:4px; padding:4px 0;'
        product.colors.forEach(color => {
          const dot = document.createElement('span')
          dot.title = color.name
          dot.style.cssText = `display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${color.htmlColor}; border:1px solid rgba(0,0,0,0.15); flex-shrink:0;`
          swatchContainer.appendChild(dot)
        })
        const existingBtn = textDiv?.querySelector('a.shop-btn')
        if (existingBtn) {
          textDiv.insertBefore(swatchContainer, existingBtn)
        } else {
          textDiv?.appendChild(swatchContainer)
        }
      }

      if (btnEnabled.value) {
        const btn = document.createElement('a')
        btn.href = '#'
        btn.setAttribute('data-product-id', String(product.id ?? ''))
        btn.className = 'shop-btn'
        btn.style.cssText = `display:inline-block; background-color:${btnBg.value}; color:${btnColor.value}; padding:8px 16px; text-decoration:none; font-size:14px; cursor:pointer; border:none; width:100%; text-align:center; box-sizing:border-box; margin-top:auto;`
        btn.textContent = btnText.value
        textDiv.appendChild(btn)
      }
    }
  })

  // Clear slots that have no selected product
  imgs.forEach((img, i) => {
    if (!selected.value[i]) {
      img.setAttribute('src',
        'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E'
      )
      const parentDiv = img.parentElement
      if (parentDiv) {
        const ps = parentDiv.querySelectorAll('p')
        if (ps[0]) ps[0].textContent = 'Layouts and visual.'
        if (ps[1]) ps[1].textContent =
          'Start customizing by editing this default text directly in the editor.'
        const cardDiv = img.closest('.flex-1, .pbx-flex-1')
          ?? parentDiv
        cardDiv.querySelector('.color-swatches')?.remove()
        cardDiv.querySelectorAll('a.shop-btn')
          .forEach(b => b.remove())
        // Remove flex styles from textDiv
        const textDiv = cardDiv.querySelector(
          '.break-words, .pbx-break-words'
        ) ?? parentDiv
        textDiv.style.display = ''
        textDiv.style.flexDirection = ''
      }
    }
  })

  // Store selected product IDs on section for reliable pre-population
  section.setAttribute(
    'data-selected-products',
    JSON.stringify(selected.value.map(p => p.id))
  )

  pageBuilderService.handleManualSave()
}

function toggle(product) {
  const idx = selected.value.findIndex(
    p => p.id === product.id
  )
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else if (selected.value.length < maxSelection.value) {
    selected.value.push(product)
  }
  // Always re-apply all selected products
  doApply()
}

function isSelected(product) {
  return selected.value.some((p) => p.id === product.id)
}

function isDisabled(product) {
  return !isSelected(product) && selected.value.length >= maxSelection.value
}

function applyBackgroundLive() {
  const section = getSection()
  if (!section) return
  section.style.backgroundColor = bgColor.value
  if (bgImageUrl.value.trim()) {
    if (!bgImageUrl.value.trim().startsWith('http')) {
      bgImageError.value = 'URL must start with http:// or https://'
      return
    }
    bgImageError.value = ''
    section.style.backgroundImage = `url('${bgImageUrl.value.trim()}')`
    section.style.backgroundSize = 'cover'
    section.style.backgroundPosition = 'center'
    section.style.backgroundRepeat = 'no-repeat'
  } else {
    bgImageError.value = ''
    section.style.backgroundImage = ''
  }
  pageBuilderService.handleManualSave()
}

function applyCardStylesLive() {
  const section = getSection()
  if (!section) return
  const cards = section.querySelectorAll('.flex-1, .pbx-flex-1')
  if (!cards.length) return
  cards.forEach(card => {
    card.style.backgroundColor = cardBg.value
    card.style.color = cardTextColor.value
    card.style.fontSize = cardFontSize.value + 'px'
    card.style.borderRadius = cardBorderRadius.value + 'px'
    card.style.boxShadow = shadowPresets[cardShadow.value] ?? 'none'
    card.style.margin = cardMargin.value + 'px'
    card.style.padding = cardPadding.value + 'px'
  })
  pageBuilderService.handleManualSave()
}

function applyButtonLive() {
  const section = getSection()
  if (!section) return

  const existingBtns = section.querySelectorAll('a.shop-btn')

  if (!btnEnabled.value) {
    existingBtns.forEach(btn => btn.remove())
    pageBuilderService.handleManualSave()
    return
  }

  if (existingBtns.length > 0) {
    existingBtns.forEach(btn => {
      btn.textContent = btnText.value
      btn.style.backgroundColor = btnBg.value
      btn.style.color = btnColor.value
    })
    pageBuilderService.handleManualSave()
  } else if (selected.value.length > 0) {
    doApply()
  }
}

const debouncedBackground = debounce(applyBackgroundLive, 300)
const debouncedCardNumbers = debounce(applyCardStylesLive, 300)
const debouncedButtonText = debounce(applyButtonLive, 300)

watch(bgColor, applyBackgroundLive)
watch(bgImageUrl, debouncedBackground)
watch([cardBg, cardTextColor, cardShadow], applyCardStylesLive)
watch([cardFontSize, cardBorderRadius, cardMargin, cardPadding], debouncedCardNumbers)
watch([btnEnabled, btnBg, btnColor], applyButtonLive)
watch(btnText, debouncedButtonText)
</script>

<template>
  <div class="mt-1 mb-3">
    <p class="font-medium text-sm mb-2 px-1">
      Select products
      <span class="text-gray-400 font-normal text-xs">&nbsp;{{ selected.length }}/{{ maxSelection }}</span>
    </p>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-6">
      <div
        class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
        role="status"
      >
        <span class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="text-red-600 text-xs px-1 py-2">
      {{ errorMsg }}
    </div>

    <!-- Search + grid -->
    <div v-else>
      <!-- Search -->
      <div class="px-1 mb-2">
        <input
          v-model="search"
          type="text"
          placeholder="Search products..."
          class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
        />
      </div>

      <!-- No results -->
      <p
        v-if="filteredProducts.length === 0"
        class="text-xs text-gray-400 text-center py-4"
      >
        No products found
      </p>

      <!-- Product grid -->
      <div v-else class="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto px-1 pb-1">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          @click="!isDisabled(product) && toggle(product)"
          :class="[
            'relative border-2 rounded overflow-hidden transition-colors',
            isSelected(product)
              ? 'border-blue-500 cursor-pointer'
              : isDisabled(product)
              ? 'border-transparent opacity-40 cursor-not-allowed'
              : 'border-transparent cursor-pointer hover:border-gray-300',
          ]"
        >
          <img
            :src="productImageSrc(product.image)"
            :alt="product.name"
            class="w-full aspect-square object-cover block"
          />
          <div class="px-1 py-1">
            <p class="text-xs font-medium truncate leading-tight m-0">{{ product.name }}</p>
            <p class="text-xs text-gray-500 leading-tight m-0">{{ product.price }}</p>
          </div>
          <div v-if="product.colors?.length" class="flex gap-1 px-1 pb-1">
            <div
              v-for="color in product.colors"
              :key="color.id"
              :title="color.name"
              :style="{ backgroundColor: color.htmlColor }"
              class="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
            />
          </div>
          <!-- Checkmark badge -->
          <div
            v-if="isSelected(product)"
            class="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center"
          >
            <span class="text-white text-xs leading-none">✓</span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-4"></div>

      <!-- Background configurator -->
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Background</p>

        <!-- Background color -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Color</label>
          <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
            <input
              v-model="bgColor"
              type="color"
              class="w-5 h-5 rounded border-0 cursor-pointer p-0"
            />
            <span class="text-xs text-gray-600 font-mono">{{ bgColor }}</span>
          </div>
        </div>

        <!-- Background image URL -->
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1">Image URL</label>
          <input
            v-model="bgImageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
            class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
          />
          <p v-if="bgImageError" class="text-red-500 text-xs mt-1">{{ bgImageError }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-4"></div>

      <!-- Card Style configurator -->
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Card Style</p>

        <!-- Row 1: Card bg + text color -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Background</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input
                v-model="cardBg"
                type="color"
                class="w-5 h-5 rounded border-0 cursor-pointer p-0"
              />
              <span class="text-xs text-gray-600 font-mono">{{ cardBg }}</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Text color</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input
                v-model="cardTextColor"
                type="color"
                class="w-5 h-5 rounded border-0 cursor-pointer p-0"
              />
              <span class="text-xs text-gray-600 font-mono">{{ cardTextColor }}</span>
            </div>
          </div>
        </div>

        <!-- Row 2: Font size + Border radius -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Font size</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardFontSize"
                type="number"
                min="10"
                max="32"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Border radius</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardBorderRadius"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>

        <!-- Row 3: Box shadow dropdown -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Box shadow</label>
          <select
            v-model="cardShadow"
            class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none bg-white focus:border-gray-500 cursor-pointer"
          >
            <option value="none">None</option>
            <option value="shadow-2xs">2xs</option>
            <option value="shadow-xs">xs</option>
            <option value="shadow-sm">sm</option>
            <option value="shadow-md">md</option>
            <option value="shadow-lg">lg</option>
            <option value="shadow-xl">xl</option>
            <option value="shadow-2xl">2xl</option>
          </select>
        </div>

        <!-- Row 4: Margin + Padding -->
        <div class="flex gap-2 mb-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Margin</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardMargin"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Padding</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardPadding"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-4"></div>

      <!-- Button configurator -->
      <div class="px-1">
        <!-- Section header + toggle -->
        <div class="flex items-center justify-between mb-3">
          <p class="font-medium text-sm">Button</p>
          <div class="flex items-center cursor-pointer" @click.prevent="btnEnabled = !btnEnabled">
            <div class="relative w-9 h-5">
              <div
                :class="[
                  'absolute inset-0 rounded-full transition-colors duration-200',
                  btnEnabled ? 'bg-black' : 'bg-gray-300',
                ]"
              ></div>
              <div
                :class="[
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                  btnEnabled ? 'translate-x-5' : 'translate-x-0.5',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Config fields — only when toggle is on -->
        <div v-if="btnEnabled" class="flex flex-col gap-2">
          <!-- Button text -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Button text</label>
            <input
              v-model="btnText"
              type="text"
              class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
            />
          </div>

          <!-- Color pickers -->
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Background</label>
              <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
                <input
                  v-model="btnBg"
                  type="color"
                  class="w-5 h-5 rounded border-0 cursor-pointer p-0"
                />
                <span class="text-xs text-gray-600 font-mono">{{ btnBg }}</span>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Text color</label>
              <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
                <input
                  v-model="btnColor"
                  type="color"
                  class="w-5 h-5 rounded border-0 cursor-pointer p-0"
                />
                <span class="text-xs text-gray-600 font-mono">{{ btnColor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
