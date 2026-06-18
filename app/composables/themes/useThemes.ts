import { type ThemeSection, ru1HomepageSections, ru1HomepageSvg, ru2ShoppageSections, ru2ShoppageSvg, ru3ShopSections, ru3ShopSvg } from './themes-data'
import {
  ru1NavbarDefaults, ru1NavbarFields, renderRu1Navbar,
  ru1HeroDefaults, ru1HeroFields, renderRu1Hero,
  ru1ProductsDefaults, ru1ProductsFields, renderRu1Products,
  ru1FooterDefaults, ru1FooterFields, renderRu1Footer,
  ru2ShopHeroDefaults, ru2ShopHeroFields, renderRu2ShopHero,
  ru2ShopContentDefaults, ru2ShopContentFields, renderRu2ShopContent,
  ru3ShopHeaderDefaults, ru3ShopHeaderFields, renderRu3ShopHeader,
  ru3ShopFiltersDefaults, ru3ShopFiltersFields, renderRu3ShopFilters,
  ru3ShopProductsDefaults, ru3ShopProductsFields, renderRu3ShopProducts,
  ru2HomePageSvg, ru2HomePageSections,
  ru2HomeNavbarDefaults, ru2HomeCarouselDefaults, ru2HomeStatsDefaults,
  ru2HomeSplitHeroDefaults, ru2HomeFooterDefaults,
  ru3HomePageSvg, ru3HomePageSections,
  ru3HomeNavbarDefaults, ru3HomeSplitHeroDefaults, ru3HomeStatsDefaults,
  ru3HomeEditorialDefaults, ru3HomeFooterDefaults,
  ru4HomePageSvg, ru4HomePageSections,
  ru4HomeNavbarDefaults, ru4HomeSplitHeroDefaults, ru4HomeStepsDefaults,
  ru4HomeAboutSplitDefaults, ru4HomeFooterDefaults,
} from './themes-data'
import {
  megaMenuHeaderFields, renderMegaMenuHeader,
  footer1Fields, renderFooter1,
  ru1StatsFields, renderRu1Stats,
  ru2StatsFields, renderRu2Stats,
  ru3StatsFields, renderRu3Stats,
  ru4StatsFields, renderRu4Stats,
  ru5ImageCarouselFields, renderRu5ImageCarousel,
  ru6SplitHeroFields, renderRu6SplitHero,
} from '../layouts/components'
import { useBlockRegistry } from '../editor/useBlockRegistry'
import { NAVBAR_TITLES, FOOTER_TITLES } from '~/composables/useGlobalSections'

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

export const themeRegistry: Record<string, Theme> = {
  'Ru1-HomePage': {
    meta: {
      id: 'Ru1-HomePage',
      name: 'Ru1-HomePage',
      description: 'Branded employee store theme',
      category: 'Home',
      cover_image: ru1HomepageSvg,
    },
    sections: ru1HomepageSections,
  },
  'Ru1-ShopPage': {
    meta: {
      id: 'Ru1-ShopPage',
      name: 'Ru1-ShopPage',
      description: 'Shop page with sidebar filters and product grid',
      category: 'Shop',
      cover_image: ru2ShoppageSvg,
    },
    sections: ru2ShoppageSections,
  },
  'Ru2-ShopPage': {
    meta: {
      id: 'Ru2-ShopPage',
      name: 'Ru2-ShopPage',
      description: 'A complete shop page with filters, sorting and product grid',
      category: 'Shop',
      cover_image: ru3ShopSvg,
    },
    sections: ru3ShopSections,
  },
  'Ru2-HomePage': {
    meta: {
      id: 'Ru2-HomePage',
      name: 'Ru2 HomePage',
      description: 'Bold dark theme with amber accents for industrial brands',
      category: 'Home',
      cover_image: ru2HomePageSvg,
    },
    sections: ru2HomePageSections,
  },
  'Ru3-HomePage': {
    meta: {
      id: 'Ru3-HomePage',
      name: 'Ru3 HomePage',
      description: 'Clean professional theme with navy and mint',
      category: 'Home',
      cover_image: ru3HomePageSvg,
    },
    sections: ru3HomePageSections,
  },
  'Ru4-HomePage': {
    meta: {
      id: 'Ru4-HomePage',
      name: 'Ru4 HomePage',
      description: 'Warm terracotta theme with burnt orange accents',
      category: 'Home',
      cover_image: ru4HomePageSvg,
    },
    sections: ru4HomePageSections,
  },
}

export function useThemes() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Ru1 Homepage Navbar', { defaults: ru1NavbarDefaults, fields: ru1NavbarFields, render: renderRu1Navbar })
  blockRegistry.register('Ru1 Homepage Hero', { defaults: ru1HeroDefaults, fields: ru1HeroFields, render: renderRu1Hero })
  blockRegistry.register('Ru1 Homepage Featured Products', { defaults: ru1ProductsDefaults, fields: ru1ProductsFields, render: renderRu1Products })
  blockRegistry.register('Ru1 Homepage Footer', { defaults: ru1FooterDefaults, fields: ru1FooterFields, render: renderRu1Footer })

  blockRegistry.register('Ru1 Shop Hero', { defaults: ru2ShopHeroDefaults, fields: ru2ShopHeroFields, render: renderRu2ShopHero })
  blockRegistry.register('Ru1 Shop Content', { defaults: ru2ShopContentDefaults, fields: ru2ShopContentFields, render: renderRu2ShopContent })

  blockRegistry.register('Ru2 Shop Header', { defaults: ru3ShopHeaderDefaults, fields: ru3ShopHeaderFields, render: renderRu3ShopHeader })
  blockRegistry.register('Ru2 Shop Filters', { defaults: ru3ShopFiltersDefaults, fields: ru3ShopFiltersFields, render: renderRu3ShopFilters })
  blockRegistry.register('Ru2 Shop Products', { defaults: ru3ShopProductsDefaults, fields: ru3ShopProductsFields, render: renderRu3ShopProducts })

  blockRegistry.register('Ru2-Home-Navbar',    { defaults: ru2HomeNavbarDefaults,    fields: megaMenuHeaderFields,    render: renderMegaMenuHeader })
  blockRegistry.register('Ru2-Home-Carousel',  { defaults: ru2HomeCarouselDefaults,  fields: ru5ImageCarouselFields,  render: renderRu5ImageCarousel })
  blockRegistry.register('Ru2-Home-Stats',     { defaults: ru2HomeStatsDefaults,     fields: ru1StatsFields,          render: renderRu1Stats })
  blockRegistry.register('Ru2-Home-SplitHero', { defaults: ru2HomeSplitHeroDefaults, fields: ru6SplitHeroFields,      render: renderRu6SplitHero })
  blockRegistry.register('Ru2-Home-Footer',    { defaults: ru2HomeFooterDefaults,    fields: footer1Fields,           render: renderFooter1 })
  blockRegistry.register('Ru3-Home-Navbar',    { defaults: ru3HomeNavbarDefaults,    fields: megaMenuHeaderFields,    render: renderMegaMenuHeader })
  blockRegistry.register('Ru3-Home-SplitHero', { defaults: ru3HomeSplitHeroDefaults, fields: ru6SplitHeroFields,      render: renderRu6SplitHero })
  blockRegistry.register('Ru3-Home-Stats',     { defaults: ru3HomeStatsDefaults,     fields: ru2StatsFields,          render: renderRu2Stats })
  blockRegistry.register('Ru3-Home-Editorial', { defaults: ru3HomeEditorialDefaults, fields: ru4StatsFields,          render: renderRu4Stats })
  blockRegistry.register('Ru3-Home-Footer',    { defaults: ru3HomeFooterDefaults,    fields: footer1Fields,           render: renderFooter1 })

  blockRegistry.register('Ru4 Homepage Navbar',    { defaults: ru4HomeNavbarDefaults,     fields: megaMenuHeaderFields, render: renderMegaMenuHeader })
  blockRegistry.register('Ru4 Homepage SplitHero', { defaults: ru4HomeSplitHeroDefaults,  fields: ru6SplitHeroFields,   render: renderRu6SplitHero })
  blockRegistry.register('Ru4 Homepage Steps',     { defaults: ru4HomeStepsDefaults,      fields: ru3StatsFields,       render: renderRu3Stats })
  blockRegistry.register('Ru4 Homepage About',     { defaults: ru4HomeAboutSplitDefaults, fields: ru6SplitHeroFields,   render: renderRu6SplitHero })
  blockRegistry.register('Ru4 Homepage Footer',    { defaults: ru4HomeFooterDefaults,     fields: footer1Fields,        render: renderFooter1 })

  async function applyTheme(themeId: string) {
    const theme = themeRegistry[themeId]
    if (!theme) return

    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any

    const liveSectionCheck = Array.from(document.querySelectorAll('section[data-component-title]'))
    const hasGlobals = liveSectionCheck.some(s =>
      NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? '') ||
      FOOTER_TITLES.includes(s.getAttribute('data-component-title') ?? '')
    )

    if (hasGlobals) {
      const contentSections = theme.sections.filter(s =>
        !NAVBAR_TITLES.includes(s.title) && !FOOTER_TITLES.includes(s.title)
      )

      const { usePageBuilderStateStore } = await import('@myissue/vue-website-page-builder')
      const store = usePageBuilderStateStore() as any

      for (const section of [...contentSections].reverse()) {
        const liveSections = Array.from(document.querySelectorAll('section[data-component-title]'))
        const headerIdx = liveSections.findIndex(s =>
          NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? '')
        )
        const insertAt = headerIdx !== -1 ? headerIdx + 1 : 0

        store.setComponentArrayAddMethod('insert')
        store.setAddComponentAddIndex(insertAt)
        await nextTick()
        await builder.addComponent(section)
      }

      store.setComponentArrayAddMethod('unshift')
    } else {
      for (const section of [...theme.sections].reverse()) {
        await builder.addComponent(section)
      }
    }
  }

  return { themeRegistry, applyTheme }
}
