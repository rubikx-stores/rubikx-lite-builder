interface ThemeSection {
  id: null
  title: string
  html_code: string
}

interface ThemeMeta {
  id: string
  name: string
  description: string
  category: string
  cover_image: string
}

interface Theme {
  meta: ThemeMeta
  sections: ThemeSection[]
}

const ru1TechwireSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="30" height="5"/>
  <rect fill="#718096" x="180" y="6" width="18" height="5"/>
  <rect fill="#718096" x="203" y="6" width="18" height="5"/>
  <rect fill="#718096" x="226" y="6" width="18" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#394152" x="0" y="26" width="280" height="75"/>
  <polygon fill="#718096" points="80 85 115 50 150 85 80 85"/>
  <polygon fill="#718096" points="145 85 163 65 181 85 145 85"/>
  <circle fill="#718096" cx="163" cy="56" r="6"/>
  <rect fill="#394152" x="0" y="112" width="90" height="7"/>
  <rect fill="#394152" x="0" y="128" width="62" height="56"/>
  <rect fill="#394152" x="73" y="128" width="62" height="56"/>
  <rect fill="#394152" x="146" y="128" width="62" height="56"/>
  <rect fill="#394152" x="219" y="128" width="61" height="56"/>
  <polygon fill="#718096" points="8 174 22 155 36 174 8 174"/>
  <polygon fill="#718096" points="81 174 95 155 109 174 81 174"/>
  <polygon fill="#718096" points="154 174 168 155 182 174 154 174"/>
  <polygon fill="#718096" points="227 174 241 155 255 174 227 174"/>
  <rect fill="#394152" x="0" y="192" width="55" height="4"/>
  <rect fill="#394152" x="73" y="192" width="55" height="4"/>
  <rect fill="#394152" x="146" y="192" width="55" height="4"/>
  <rect fill="#394152" x="219" y="192" width="55" height="4"/>
  <rect fill="#394152" x="0" y="202" width="30" height="3"/>
  <rect fill="#394152" x="73" y="202" width="30" height="3"/>
  <rect fill="#394152" x="146" y="202" width="30" height="3"/>
  <rect fill="#394152" x="219" y="202" width="30" height="3"/>
  <rect fill="#394152" x="0" y="224" width="280" height="78"/>
  <rect fill="#718096" x="8" y="234" width="55" height="4"/>
  <rect fill="#718096" x="8" y="244" width="45" height="3"/>
  <rect fill="#718096" x="8" y="252" width="50" height="3"/>
  <rect fill="#718096" x="8" y="260" width="40" height="3"/>
  <rect fill="#718096" x="100" y="234" width="55" height="4"/>
  <rect fill="#718096" x="100" y="244" width="45" height="3"/>
  <rect fill="#718096" x="100" y="252" width="50" height="3"/>
  <rect fill="#718096" x="192" y="234" width="55" height="4"/>
  <rect fill="#718096" x="192" y="244" width="50" height="3"/>
  <rect fill="#718096" x="192" y="252" width="45" height="3"/>
  <rect fill="#718096" x="90" y="285" width="100" height="3"/>
</svg>`

const ru1TechwireSections: ThemeSection[] = [
  {
    id: null,
    title: 'Ru1 Techwire Navbar',
    html_code: `<section data-component-title="Ru1 Techwire Navbar">
<nav class="pbx-bg-white pbx-shadow-sm">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8">
    <div class="pbx-flex pbx-items-center pbx-justify-between pbx-h-16">
      <div class="pbx-flex pbx-items-center">
        <span class="pbx-text-lg pbx-font-bold pbx-text-gray-900">Your Logo</span>
      </div>
      <div class="pbx-hidden md:pbx-flex pbx-items-center pbx-gap-6">
        <a href="/" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Home</a>
        <a href="/shop" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Shop</a>
        <a href="/about" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">About Us</a>
        <a href="/signin" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Sign In</a>
        <a href="/contact" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Contact Us</a>
        <a href="/cart" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Cart</a>
      </div>
      <div class="md:pbx-hidden">
        <button class="pbx-p-2 pbx-text-gray-700">
          <svg class="pbx-h-6 pbx-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>
</section>`,
  },
  {
    id: null,
    title: 'Ru1 Techwire Hero',
    html_code: `<section data-component-title="Ru1 Techwire Hero">
<div class="pbx-relative pbx-w-full pbx-bg-gray-200 pbx-overflow-hidden" style="min-height:400px">
  <div class="pbx-absolute pbx-inset-0 pbx-flex pbx-flex-col pbx-items-center pbx-justify-center pbx-text-center pbx-px-4">
    <h1 class="pbx-text-4xl pbx-font-bold pbx-text-gray-900 pbx-mb-4">Welcome to Our Store</h1>
    <p class="pbx-text-lg pbx-text-gray-600 pbx-mb-8">Order branded apparel and accessories for your team</p>
    <div class="pbx-flex pbx-gap-4">
      <a href="/shop" class="pbx-bg-gray-900 pbx-text-white pbx-font-semibold pbx-px-6 pbx-py-3 pbx-rounded hover:pbx-bg-gray-700 pbx-transition-colors">Shop Now</a>
      <a href="/about" class="pbx-border pbx-border-gray-900 pbx-text-gray-900 pbx-font-semibold pbx-px-6 pbx-py-3 pbx-rounded hover:pbx-bg-gray-100 pbx-transition-colors">Learn More</a>
    </div>
  </div>
</div>
</section>`,
  },
  {
    id: null,
    title: 'Ru1 Techwire Products',
    html_code: `<section data-component-title="Ru1 Techwire Products">
<div class="pbx-bg-white pbx-py-12">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8">
    <h2 class="pbx-text-2xl pbx-font-bold pbx-text-gray-900 pbx-mb-8">Featured Products</h2>
    <div class="pbx-grid pbx-grid-cols-2 md:pbx-grid-cols-3 lg:pbx-grid-cols-4 pbx-gap-6">
      <div class="pbx-bg-white pbx-rounded-lg pbx-border pbx-border-gray-200 pbx-overflow-hidden hover:pbx-shadow-md pbx-transition-shadow">
        <div class="pbx-bg-gray-100 pbx-h-48 pbx-flex pbx-items-center pbx-justify-center">
          <span class="pbx-text-gray-400 pbx-text-sm">Product Image</span>
        </div>
        <div class="pbx-p-4">
          <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-900 pbx-mb-1">Product Name</h3>
          <p class="pbx-text-sm pbx-text-gray-500 pbx-mb-3">$0.00</p>
          <button class="pbx-w-full pbx-bg-gray-900 pbx-text-white pbx-text-sm pbx-font-medium pbx-py-2 pbx-rounded hover:pbx-bg-gray-700 pbx-transition-colors">Add to Cart</button>
        </div>
      </div>
      <div class="pbx-bg-white pbx-rounded-lg pbx-border pbx-border-gray-200 pbx-overflow-hidden hover:pbx-shadow-md pbx-transition-shadow">
        <div class="pbx-bg-gray-100 pbx-h-48 pbx-flex pbx-items-center pbx-justify-center">
          <span class="pbx-text-gray-400 pbx-text-sm">Product Image</span>
        </div>
        <div class="pbx-p-4">
          <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-900 pbx-mb-1">Product Name</h3>
          <p class="pbx-text-sm pbx-text-gray-500 pbx-mb-3">$0.00</p>
          <button class="pbx-w-full pbx-bg-gray-900 pbx-text-white pbx-text-sm pbx-font-medium pbx-py-2 pbx-rounded hover:pbx-bg-gray-700 pbx-transition-colors">Add to Cart</button>
        </div>
      </div>
      <div class="pbx-bg-white pbx-rounded-lg pbx-border pbx-border-gray-200 pbx-overflow-hidden hover:pbx-shadow-md pbx-transition-shadow">
        <div class="pbx-bg-gray-100 pbx-h-48 pbx-flex pbx-items-center pbx-justify-center">
          <span class="pbx-text-gray-400 pbx-text-sm">Product Image</span>
        </div>
        <div class="pbx-p-4">
          <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-900 pbx-mb-1">Product Name</h3>
          <p class="pbx-text-sm pbx-text-gray-500 pbx-mb-3">$0.00</p>
          <button class="pbx-w-full pbx-bg-gray-900 pbx-text-white pbx-text-sm pbx-font-medium pbx-py-2 pbx-rounded hover:pbx-bg-gray-700 pbx-transition-colors">Add to Cart</button>
        </div>
      </div>
      <div class="pbx-bg-white pbx-rounded-lg pbx-border pbx-border-gray-200 pbx-overflow-hidden hover:pbx-shadow-md pbx-transition-shadow">
        <div class="pbx-bg-gray-100 pbx-h-48 pbx-flex pbx-items-center pbx-justify-center">
          <span class="pbx-text-gray-400 pbx-text-sm">Product Image</span>
        </div>
        <div class="pbx-p-4">
          <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-900 pbx-mb-1">Product Name</h3>
          <p class="pbx-text-sm pbx-text-gray-500 pbx-mb-3">$0.00</p>
          <button class="pbx-w-full pbx-bg-gray-900 pbx-text-white pbx-text-sm pbx-font-medium pbx-py-2 pbx-rounded hover:pbx-bg-gray-700 pbx-transition-colors">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</div>
</section>`,
  },
  {
    id: null,
    title: 'Ru1 Techwire Footer',
    html_code: `<section data-component-title="Ru1 Techwire Footer">
<footer class="pbx-bg-gray-900 pbx-text-white">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8 pbx-py-12">
    <div class="pbx-grid pbx-grid-cols-1 md:pbx-grid-cols-3 pbx-gap-8">
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-400 pbx-uppercase pbx-tracking-wider pbx-mb-4">Useful Links</h3>
        <ul class="pbx-space-y-2">
          <li><a href="/" class="pbx-text-gray-300 hover:pbx-text-white pbx-text-sm">Home</a></li>
          <li><a href="/shop" class="pbx-text-gray-300 hover:pbx-text-white pbx-text-sm">Shop</a></li>
          <li><a href="/about" class="pbx-text-gray-300 hover:pbx-text-white pbx-text-sm">About Us</a></li>
          <li><a href="/contact" class="pbx-text-gray-300 hover:pbx-text-white pbx-text-sm">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-400 pbx-uppercase pbx-tracking-wider pbx-mb-4">About Us</h3>
        <p class="pbx-text-gray-300 pbx-text-sm pbx-leading-relaxed">This site is for employees to order branded apparel and accessories.</p>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-text-gray-400 pbx-uppercase pbx-tracking-wider pbx-mb-4">Connect with Us</h3>
        <ul class="pbx-space-y-2">
          <li class="pbx-text-gray-300 pbx-text-sm">support@yourdomain.com</li>
          <li class="pbx-text-gray-300 pbx-text-sm">+1 000-000-0000</li>
        </ul>
      </div>
    </div>
    <div class="pbx-border-t pbx-border-gray-700 pbx-mt-8 pbx-pt-6 pbx-text-center">
      <p class="pbx-text-gray-400 pbx-text-sm">© Your Store. All rights reserved.</p>
    </div>
  </div>
</footer>
</section>`,
  },
]

export const themeRegistry: Record<string, Theme> = {
  'ru1-techwire': {
    meta: {
      id: 'ru1-techwire',
      name: 'Ru1-Techwire',
      description: 'Branded employee store theme',
      category: 'General',
      cover_image: ru1TechwireSvg,
    },
    sections: ru1TechwireSections,
  },
}

export function useThemes() {
  async function applyTheme(themeId: string) {
    const theme = themeRegistry[themeId]
    if (!theme) return
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder()
    for (const section of theme.sections) {
      await builder.addComponent(section)
    }
  }
  return { themeRegistry, applyTheme }
}
