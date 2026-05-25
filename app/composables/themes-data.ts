export interface ThemeSection {
  id: null
  title: string
  html_code: string
}

const placeholderSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="#394152" width="200" height="150"/><polygon fill="#718096" points="65 90 90 60 115 90"/><polygon fill="#718096" points="110 90 122.5 75 135 90"/><circle fill="#718096" cx="122.5" cy="64" r="4"/></svg>')}`

export const ru1TechwireSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
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

export const ru1TechwireSections: ThemeSection[] = [
  {
    id: null,
    title: 'Ru1 Techwire Navbar',
    html_code: `<section data-component-title="Ru1 Techwire Navbar">
<nav class="pbx-bg-white pbx-shadow-sm">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8">
    <!-- Top row: Logo | Search | Actions -->
    <div class="pbx-flex pbx-items-center pbx-justify-between pbx-gap-4 pbx-py-3 pbx-border-b pbx-border-gray-100">
      <div class="pbx-flex-shrink-0">
        <span class="pbx-text-lg pbx-font-bold pbx-text-gray-900">Your Logo</span>
      </div>
      <div class="pbx-flex-1 pbx-max-w-md pbx-hidden md:pbx-block">
        <input type="text" placeholder="Search products..." class="pbx-w-full pbx-border pbx-border-gray-300 pbx-rounded pbx-px-3 pbx-py-1.5 pbx-text-sm pbx-text-gray-700 focus:pbx-outline-none" />
      </div>
      <div class="pbx-flex pbx-items-center pbx-gap-4">
        <a href="/contact" class="pbx-hidden md:pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Contact Us</a>
        <a href="/signup" class="pbx-hidden md:pbx-block pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Sign Up</a>
        <a href="/cart" class="pbx-text-gray-700 hover:pbx-text-gray-900">
          <svg class="pbx-h-6 pbx-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </a>
        <div class="md:pbx-hidden">
          <button class="pbx-p-2 pbx-text-gray-700">
            <svg class="pbx-h-6 pbx-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Bottom row: Nav links -->
    <div class="pbx-hidden md:pbx-flex pbx-items-center pbx-gap-6 pbx-py-2">
      <a href="/" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Home</a>
      <a href="/shop" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">Shop</a>
      <a href="/about" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900">About Us</a>
    </div>
  </div>
</nav>
</section>`,
  },

  {
    id: null,
    title: 'Ru1 Techwire Hero',
    html_code: `<section data-component-title="Ru1 Techwire Hero">
<div class="md:pbx-pt-16 md:pbx-pb-16 pbx-pt-6 pbx-pb-6 lg:pbx-px-4 pbx-px-2">
  <div class="pbx-mx-auto pbx-max-w-7xl">
    <div class="pbx-myPrimaryGap pbx-grid pbx-grid-cols-1 sm:pbx-grid-cols-1 lg:pbx-grid-cols-2 pbx-items-center">
      <div class="pbx-flex-1 pbx-py-2">
        <p class="pbx-font-semibold pbx-mb-4">Branded Merchandise Store</p>
        <div class="pbx-break-words pbx-font-medium pbx-text-3xl lg:pbx-text-6xl pbx-mb-6">
          <h1>Order Branded Gear Your Team Will Love</h1>
        </div>
        <div class="pbx-mb-8">
          <p>Premium branded apparel and accessories for your team. Fast delivery, custom designs, company pride delivered to your door.</p>
        </div>
        <div class="pbx-flex pbx-gap-4 pbx-flex-wrap">
          <a href="/shop" class="pbx-myPrimaryButton">Shop Now</a>
          <a href="/about" class="pbx-mySecondaryButton">Learn More</a>
        </div>
      </div>
      <div class="pbx-flex-1 pbx-py-2">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${placeholderSvg}" alt="Hero image" />
      </div>
    </div>
  </div>
</div>
</section>`,
  },

  {
    id: null,
    title: 'Ru1 Techwire Featured Products',
    html_code: `<section data-component-title="Ru1 Techwire Featured Products">
<div class="md:pbx-pt-16 md:pbx-pb-16 pbx-pt-6 pbx-pb-6 lg:pbx-px-4 pbx-px-2">
  <div class="pbx-mx-auto pbx-max-w-7xl">
    <div class="pbx-break-words pbx-font-medium pbx-text-3xl lg:pbx-text-6xl pbx-mb-8">
      <h2>Featured Products</h2>
    </div>
    <div class="pbx-myPrimaryGap pbx-grid pbx-grid-cols-2 sm:pbx-grid-cols-2 lg:pbx-grid-cols-4">
      <div class="pbx-flex-1 pbx-py-2">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${placeholderSvg}" alt="Product image" />
        <div class="pbx-break-words pbx-py-2">
          <p class="pbx-font-semibold">Product Name</p>
          <p>$0.00</p>
          <a href="/shop" class="pbx-mySecondaryButton pbx-mt-2">Add to Cart</a>
        </div>
      </div>
      <div class="pbx-flex-1 pbx-py-2">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${placeholderSvg}" alt="Product image" />
        <div class="pbx-break-words pbx-py-2">
          <p class="pbx-font-semibold">Product Name</p>
          <p>$0.00</p>
          <a href="/shop" class="pbx-mySecondaryButton pbx-mt-2">Add to Cart</a>
        </div>
      </div>
      <div class="pbx-flex-1 pbx-py-2">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${placeholderSvg}" alt="Product image" />
        <div class="pbx-break-words pbx-py-2">
          <p class="pbx-font-semibold">Product Name</p>
          <p>$0.00</p>
          <a href="/shop" class="pbx-mySecondaryButton pbx-mt-2">Add to Cart</a>
        </div>
      </div>
      <div class="pbx-flex-1 pbx-py-2">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${placeholderSvg}" alt="Product image" />
        <div class="pbx-break-words pbx-py-2">
          <p class="pbx-font-semibold">Product Name</p>
          <p>$0.00</p>
          <a href="/shop" class="pbx-mySecondaryButton pbx-mt-2">Add to Cart</a>
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
<footer>
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8 pbx-py-12">
    <div class="pbx-grid pbx-grid-cols-1 md:pbx-grid-cols-3 pbx-gap-8">
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Useful Links</h3>
        <ul class="pbx-space-y-2">
          <li><a href="/" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">Home</a></li>
          <li><a href="/shop" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">Shop</a></li>
          <li><a href="/about" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">About Us</a></li>
          <li><a href="/contact" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">About Us</h3>
        <p class="pbx-text-sm pbx-text-gray-700 pbx-leading-relaxed">This site is for employees to order branded apparel and accessories.</p>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Connect with Us</h3>
        <ul class="pbx-space-y-2">
          <li class="pbx-text-sm pbx-text-gray-700">support@yourdomain.com</li>
          <li class="pbx-text-sm pbx-text-gray-700">+1 000-000-0000</li>
        </ul>
      </div>
    </div>
    <div class="pbx-border-t pbx-border-gray-200 pbx-mt-8 pbx-pt-6 pbx-text-center">
      <p class="pbx-text-sm pbx-text-gray-500">© Your Store. All rights reserved.</p>
    </div>
  </div>
</footer>
</section>`,
  },
]
