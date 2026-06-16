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
} from './themes-data'
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
