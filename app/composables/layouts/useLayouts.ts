import { useBlockRegistry } from '../editor/useBlockRegistry'
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
  footer1Defaults,
  footer1Fields,
  footer1Svg,
  renderFooter1,
  ru1AboutDefaults,
  ru1AboutFields,
  ru1AboutSvg,
  renderRu1About,
  ru1FaqDefaults,
  ru1FaqFields,
  ru1FaqSvg,
  renderRu1Faq,
  ru2SplitBannerCollageDefaults,
  ru2SplitBannerCollageFields,
  ru2SplitBannerCollageSvg,
  renderRu2SplitBannerCollage,
} from './components'

export interface LayoutComponentItem {
  title: string
  category: string
  cover_image: string
  html_code: string
}

export const layoutComponentRegistry: Record<string, LayoutComponentItem[]> = {
  Headers: [
    {
      title: 'Mega-menu-Header',
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
  ],
  Contact: [
    {
      title: 'Ru1-Form',
      category: 'Contact',
      cover_image: ru1FormSvg,
      html_code: renderRu1Form(ru1FormDefaults),
    },
  ],
  'About Us': [
    {
      title: 'Ru1-About',
      category: 'About Us',
      cover_image: ru1AboutSvg,
      html_code: renderRu1About(ru1AboutDefaults),
    },
  ],
  FAQs: [
    {
      title: 'Ru1-FAQ',
      category: 'FAQs',
      cover_image: ru1FaqSvg,
      html_code: renderRu1Faq(ru1FaqDefaults),
    },
  ],
  Footer: [
    {
      title: 'Footer-1',
      category: 'Footer',
      cover_image: footer1Svg,
      html_code: renderFooter1(footer1Defaults),
    },
  ],
}

export function useLayouts() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Mega-menu-Header', {
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

  blockRegistry.register('Ru1-About', {
    defaults: ru1AboutDefaults,
    fields: ru1AboutFields,
    render: renderRu1About,
  })

  blockRegistry.register('Ru1-FAQ', {
    defaults: ru1FaqDefaults,
    fields: ru1FaqFields,
    render: renderRu1Faq,
  })

  blockRegistry.register('Ru2-Split-Banner-Collage', {
    defaults: ru2SplitBannerCollageDefaults,
    fields: ru2SplitBannerCollageFields,
    render: renderRu2SplitBannerCollage,
  })

  blockRegistry.register('Footer-1', {
    defaults: footer1Defaults,
    fields: footer1Fields,
    render: renderFooter1,
  })

  return { layoutComponentRegistry }
}
