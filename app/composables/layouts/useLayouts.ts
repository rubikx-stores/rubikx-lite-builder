import { useBlockRegistry } from '../editor/useBlockRegistry'
import { ru1NavbarSvg, ru1NavbarDefaults, ru1NavbarFields, renderRu1Navbar } from '../themes/themes-data'
import {
  showFeaturedProductsDefaults,
  showFeaturedProductsFields,
  showFeaturedProductsSvg,
  renderShowFeaturedProducts,
} from '../themes/themes-data'
// All layout component data (interfaces, defaults, fields, render functions)
// lives in components.ts — add new components there, then register them below.
import {
  megaMenuHeaderDefaults,
  megaMenuHeaderFields,
  megaMenuHeaderSvg,
  renderMegaMenuHeader,
  bannerDefaults,
  bannerFields,
  bannerSvg,
  renderBanner,
  ru1FormDefaults,
  ru1FormFields,
  ru1FormSvg,
  renderRu1Form,
  ru2FormDefaults,
  ru2FormFields,
  ru2FormSvg,
  renderRu2Form,
  ru3FormBannerDefaults,
  ru3FormBannerFields,
  ru3FormBannerSvg,
  renderRu3FormBanner,
  ru1FooterDefaults,
  ru1FooterFields,
  ru1FooterSvg,
  renderRu1Footer,
  ru1AboutDefaults,
  ru1AboutFields,
  ru1AboutSvg,
  renderRu1About,
  ru2AboutDefaults,
  ru2AboutFields,
  ru2AboutSvg,
  renderRu2About,
  ru1FaqDefaults,
  ru1FaqFields,
  ru1FaqSvg,
  renderRu1Faq,
  ru2FaqBannerDefaults,
  ru2FaqBannerFields,
  ru2FaqBannerSvg,
  renderRu2FaqBanner,
  ru2SplitBannerCollageDefaults,
  ru2SplitBannerCollageFields,
  ru2SplitBannerCollageSvg,
  renderRu2SplitBannerCollage,
  ru5ImageCarouselDefaults,
  ru5ImageCarouselFields,
  ru5ImageCarouselSvg,
  renderRu5ImageCarousel,
  ru6SplitHeroDefaults,
  ru6SplitHeroFields,
  ru6SplitHeroSvg,
  renderRu6SplitHero,
  ru1StatsDefaults,
  ru1StatsFields,
  ru1StatsSvg,
  renderRu1Stats,
  ru2StatsDefaults,
  ru2StatsFields,
  ru2StatsSvg,
  renderRu2Stats,
  ru3StatsDefaults,
  ru3StatsFields,
  ru3StatsSvg,
  renderRu3Stats,
  ru4StatsDefaults,
  ru4StatsFields,
  ru4StatsSvg,
  renderRu4Stats,
  ru3TextImageHeroDefaults,
  ru3TextImageHeroFields,
  ru3TextImageHeroSvg,
  renderRu3TextImageHero,
  ru4OverlayPanelDefaults,
  ru4OverlayPanelFields,
  ru4OverlayPanelSvg,
  renderRu4OverlayPanel,
  ru2FooterDefaults,
  ru2FooterFields,
  ru2FooterSvg,
  renderRu2Footer,
  ru1ProductDetailDefaults,
  ru1ProductDetailFields,
  ru1ProductDetailSvg,
  renderRu1ProductDetail,
  ru2ProductDetailDefaults,
  ru2ProductDetailFields,
  ru2ProductDetailSvg,
  renderRu2ProductDetail,
  ru3ProductDetailDefaults,
  ru3ProductDetailFields,
  ru3ProductDetailSvg,
  renderRu3ProductDetail,
  showSingleProductDefaults,
  showSingleProductFields,
  showSingleProductSvg,
  renderShowSingleProduct,
  showMultipleProductsDefaults,
  showMultipleProductsFields,
  showMultipleProductsSvg,
  renderShowMultipleProducts,
  show6ProductsDefaults,
  show6ProductsFields,
  show6ProductsSvg,
  renderShow6Products,
  show4ProductsCenteredDefaults,
  show4ProductsCenteredFields,
  show4ProductsCenteredSvg,
  renderShow4ProductsCentered,
  ru1AnnouncementBarDefaults,
  ru1AnnouncementBarFields,
  ru1AnnouncementBarSvg,
  renderRu1AnnouncementBar,
} from './components'

export interface LayoutComponentItem {
  title: string
  category: string
  cover_image: string
  html_code: string
}

// Generate placeholder image data URL from Single Image SVG
const getPlaceholderImageDataUrl = (): string => {
  const singleImageSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
      <defs>
        <style>
          .bg { fill: #384152; }
          .fg { fill: #718096; }
        </style>
      </defs>
      <rect class="bg" width="200" height="150"/>
      <polygon class="fg" points="65 90.01 90 60.01 115 90.01"/>
      <polygon class="fg" points="110 90.01 122.5 75.01 135 90.01"/>
      <circle class="fg" cx="122.5" cy="64.15" r="4.16"/>
    </svg>
  `

  // Convert SVG to data URL
  const encodedSvg = encodeURIComponent(singleImageSvg.trim())
  return `data:image/svg+xml,${encodedSvg}`
}

export const layoutComponentRegistry: Record<string, LayoutComponentItem[]> = {
  Headers: [
    {
      title: 'Ru1-Navbar',
      category: 'Headers',
      cover_image: ru1NavbarSvg,
      html_code: renderRu1Navbar(ru1NavbarDefaults),
    },
    {
      title: 'Ru2-Mega-Menu-Header',
      category: 'Headers',
      cover_image: megaMenuHeaderSvg,
      html_code: renderMegaMenuHeader(megaMenuHeaderDefaults),
    },
  ],
  Banner: [
    {
      title: 'Ru1-Banner',
      category: 'Banner',
      cover_image: bannerSvg,
      html_code: renderBanner(bannerDefaults),
    },
    {
      title: 'Ru2-Split-Banner-Collage',
      category: 'Banner',
      cover_image: ru2SplitBannerCollageSvg,
      html_code: renderRu2SplitBannerCollage(ru2SplitBannerCollageDefaults),
    },
    {
      title: 'Ru3-Text + Image Hero',
      category: 'Banner',
      cover_image: ru3TextImageHeroSvg,
      html_code: renderRu3TextImageHero(ru3TextImageHeroDefaults),
    },
    {
      title: 'Ru4-Overlay Panel',
      category: 'Banner',
      cover_image: ru4OverlayPanelSvg,
      html_code: renderRu4OverlayPanel(ru4OverlayPanelDefaults),
    },
    {
      title: 'Ru5-Image-Carousel',
      category: 'Banner',
      cover_image: ru5ImageCarouselSvg,
      html_code: renderRu5ImageCarousel(ru5ImageCarouselDefaults),
    },
    {
      title: 'Ru6-Split-Hero',
      category: 'Banner',
      cover_image: ru6SplitHeroSvg,
      html_code: renderRu6SplitHero(ru6SplitHeroDefaults),
    },
  ],
  Contact: [
    {
      title: 'Ru1-Form',
      category: 'Contact',
      cover_image: ru1FormSvg,
      html_code: renderRu1Form(ru1FormDefaults),
    },
    {
      title: 'Ru2-Form',
      category: 'Contact',
      cover_image: ru2FormSvg,
      html_code: renderRu2Form(ru2FormDefaults),
    },
    {
      title: 'Ru3-Form + Banner',
      category: 'Contact',
      cover_image: ru3FormBannerSvg,
      html_code: renderRu3FormBanner(ru3FormBannerDefaults),
    },
  ],
  'About Us': [
    {
      title: 'Ru1-About',
      category: 'About Us',
      cover_image: ru1AboutSvg,
      html_code: renderRu1About(ru1AboutDefaults),
    },
    {
      title: 'Ru2-About',
      category: 'About Us',
      cover_image: ru2AboutSvg,
      html_code: renderRu2About(ru2AboutDefaults),
    },
  ],
  FAQs: [
    {
      title: 'Ru1-FAQ',
      category: 'FAQs',
      cover_image: ru1FaqSvg,
      html_code: renderRu1Faq(ru1FaqDefaults),
    },
    {
      title: 'Ru2-FAQ+Banner',
      category: 'FAQs',
      cover_image: ru2FaqBannerSvg,
      html_code: renderRu2FaqBanner(ru2FaqBannerDefaults),
    },
  ],
  Stats: [
    {
      title: 'Ru1-Stats',
      category: 'Stats',
      cover_image: ru1StatsSvg,
      html_code: renderRu1Stats(ru1StatsDefaults),
    },
    {
      title: 'Ru2-Stats',
      category: 'Stats',
      cover_image: ru2StatsSvg,
      html_code: renderRu2Stats(ru2StatsDefaults),
    },
    {
      title: 'Ru3-Stats',
      category: 'Stats',
      cover_image: ru3StatsSvg,
      html_code: renderRu3Stats(ru3StatsDefaults),
    },
    {
      title: 'Ru4-Stats',
      category: 'Stats',
      cover_image: ru4StatsSvg,
      html_code: renderRu4Stats(ru4StatsDefaults),
    },
  ],
  Footer: [
    {
      title: 'Ru1-Footer',
      category: 'Footer',
      cover_image: ru1FooterSvg,
      html_code: renderRu1Footer(ru1FooterDefaults),
    },
    {
      title: 'Ru2-Footer',
      category: 'Footer',
      cover_image: ru2FooterSvg,
      html_code: renderRu2Footer(ru2FooterDefaults),
    },
  ],
  'Product Showcase': [
    {
      title: 'Ru1-Product Detail',
      category: 'Product Showcase',
      cover_image: ru1ProductDetailSvg,
      html_code: renderRu1ProductDetail(ru1ProductDetailDefaults),
    },
    {
      title: 'Ru2-Product Detail',
      category: 'Product Showcase',
      cover_image: ru2ProductDetailSvg,
      html_code: renderRu2ProductDetail(ru2ProductDetailDefaults),
    },
    {
      title: 'Ru3-Product Detail',
      category: 'Product Showcase',
      cover_image: ru3ProductDetailSvg,
      html_code: renderRu3ProductDetail(ru3ProductDetailDefaults),
    },
  ],
  Products: [
    {
      title: 'Show Featured Products',
      category: 'Products',
      cover_image: showFeaturedProductsSvg,
      html_code: renderShowFeaturedProducts(showFeaturedProductsDefaults),
    },
    {
      title: 'Show Single Product',
      category: 'Products',
      cover_image: showSingleProductSvg,
      html_code: renderShowSingleProduct(showSingleProductDefaults),
    },
    {
      title: 'Show Multiple Products',
      category: 'Products',
      cover_image: showMultipleProductsSvg,
      html_code: renderShowMultipleProducts(showMultipleProductsDefaults),
    },
    {
      title: 'Show 6 Products',
      category: 'Products',
      cover_image: show6ProductsSvg,
      html_code: renderShow6Products(show6ProductsDefaults),
    },
    {
      title: 'Show 4 Products Centered',
      category: 'Products',
      cover_image: show4ProductsCenteredSvg,
      html_code: renderShow4ProductsCentered(show4ProductsCenteredDefaults),
    },
  ],
  'Announcement Bar': [
    {
      title: 'Ru1-Announcement Bar',
      category: 'Announcement Bar',
      cover_image: ru1AnnouncementBarSvg,
      html_code: renderRu1AnnouncementBar(ru1AnnouncementBarDefaults),
    },
  ],
}

export function useLayouts() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Ru2-Mega-Menu-Header', {
    defaults: megaMenuHeaderDefaults,
    fields: megaMenuHeaderFields,
    render: renderMegaMenuHeader,
  })

  blockRegistry.register('Ru1-Banner', {
    defaults: bannerDefaults,
    fields: bannerFields,
    render: renderBanner,
  })

  blockRegistry.register('Ru1-Form', {
    defaults: ru1FormDefaults,
    fields: ru1FormFields,
    render: renderRu1Form,
  })

  blockRegistry.register('Ru2-Form', {
    defaults: ru2FormDefaults,
    fields: ru2FormFields,
    render: renderRu2Form,
  })

  blockRegistry.register('Ru3-Form + Banner', {
    defaults: ru3FormBannerDefaults,
    fields: ru3FormBannerFields,
    render: renderRu3FormBanner,
  })

  blockRegistry.register('Ru1-About', {
    defaults: ru1AboutDefaults,
    fields: ru1AboutFields,
    render: renderRu1About,
  })

  blockRegistry.register('Ru2-About', {
    defaults: ru2AboutDefaults,
    fields: ru2AboutFields,
    render: renderRu2About,
  })

  blockRegistry.register('Ru1-FAQ', {
    defaults: ru1FaqDefaults,
    fields: ru1FaqFields,
    render: renderRu1Faq,
  })

  blockRegistry.register('Ru2-FAQ+Banner', {
    defaults: ru2FaqBannerDefaults,
    fields: ru2FaqBannerFields,
    render: renderRu2FaqBanner,
  })

  blockRegistry.register('Ru2-Split-Banner-Collage', {
    defaults: ru2SplitBannerCollageDefaults,
    fields: ru2SplitBannerCollageFields,
    render: renderRu2SplitBannerCollage,
  })

  blockRegistry.register('Ru5-Image-Carousel', {
    defaults: ru5ImageCarouselDefaults,
    fields: ru5ImageCarouselFields,
    render: renderRu5ImageCarousel,
  })

  blockRegistry.register('Ru3-Text + Image Hero', {
    defaults: ru3TextImageHeroDefaults,
    fields: ru3TextImageHeroFields,
    render: renderRu3TextImageHero,
  })

  blockRegistry.register('Ru4-Overlay Panel', {
    defaults: ru4OverlayPanelDefaults,
    fields: ru4OverlayPanelFields,
    render: renderRu4OverlayPanel,
  })

  blockRegistry.register('Ru6-Split-Hero', {
    defaults: ru6SplitHeroDefaults,
    fields: ru6SplitHeroFields,
    render: renderRu6SplitHero,
  })

  blockRegistry.register('Ru1-Footer', {
    defaults: ru1FooterDefaults,
    fields: ru1FooterFields,
    render: renderRu1Footer,
  })

  blockRegistry.register('Ru2-Footer', {
    defaults: ru2FooterDefaults,
    fields: ru2FooterFields,
    render: renderRu2Footer,
  })

  blockRegistry.register('Ru1-Product Detail', {
    defaults: ru1ProductDetailDefaults,
    fields: ru1ProductDetailFields,
    render: renderRu1ProductDetail,
  })

  blockRegistry.register('Ru2-Product Detail', {
    defaults: ru2ProductDetailDefaults,
    fields: ru2ProductDetailFields,
    render: renderRu2ProductDetail,
  })

  blockRegistry.register('Ru3-Product Detail', {
    defaults: ru3ProductDetailDefaults,
    fields: ru3ProductDetailFields,
    render: renderRu3ProductDetail,
  })

  blockRegistry.register('Ru1-Stats', {
    defaults: ru1StatsDefaults,
    fields: ru1StatsFields,
    render: renderRu1Stats,
  })

  blockRegistry.register('Ru2-Stats', {
    defaults: ru2StatsDefaults,
    fields: ru2StatsFields,
    render: renderRu2Stats,
  })

  blockRegistry.register('Ru3-Stats', {
    defaults: ru3StatsDefaults,
    fields: ru3StatsFields,
    render: renderRu3Stats,
  })

  blockRegistry.register('Ru4-Stats', {
    defaults: ru4StatsDefaults,
    fields: ru4StatsFields,
    render: renderRu4Stats,
  })

  blockRegistry.register('Show Featured Products', {
    defaults: showFeaturedProductsDefaults,
    fields: showFeaturedProductsFields,
    render: renderShowFeaturedProducts,
  })

  blockRegistry.register('Show Single Product', {
    defaults: showSingleProductDefaults,
    fields: showSingleProductFields,
    render: renderShowSingleProduct,
  })

  blockRegistry.register('Show Multiple Products', {
    defaults: showMultipleProductsDefaults,
    fields: showMultipleProductsFields,
    render: renderShowMultipleProducts,
  })

  blockRegistry.register('Show 6 Products', {
    defaults: show6ProductsDefaults,
    fields: show6ProductsFields,
    render: renderShow6Products,
  })

  blockRegistry.register('Show 4 Products Centered', {
    defaults: show4ProductsCenteredDefaults,
    fields: show4ProductsCenteredFields,
    render: renderShow4ProductsCentered,
  })

  blockRegistry.register('Ru1-Announcement Bar', {
    defaults: ru1AnnouncementBarDefaults,
    fields: ru1AnnouncementBarFields,
    render: renderRu1AnnouncementBar,
  })

  return { layoutComponentRegistry }
}
