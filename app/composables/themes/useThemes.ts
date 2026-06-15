import { type ThemeSection, ru1HomepageSections, ru1HomepageSvg, ru2ShoppageSections, ru2ShoppageSvg } from './themes-data'
import {
  ru1NavbarDefaults, ru1NavbarFields, renderRu1Navbar,
  ru1HeroDefaults, ru1HeroFields, renderRu1Hero,
  ru1ProductsDefaults, ru1ProductsFields, renderRu1Products,
  ru1FooterDefaults, ru1FooterFields, renderRu1Footer,
  ru2ShopHeroDefaults, ru2ShopHeroFields, renderRu2ShopHero,
  ru2ShopContentDefaults, ru2ShopContentFields, renderRu2ShopContent,
} from './themes-data'
import { useBlockRegistry } from '../editor/useBlockRegistry'

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
  'Ru1-Homepage': {
    meta: {
      id: 'Ru1-Homepage',
      name: 'Ru1-Homepage',
      description: 'Branded employee store theme',
      category: 'General',
      cover_image: ru1HomepageSvg,
    },
    sections: ru1HomepageSections,
  },
  'Ru2-Shoppage': {
    meta: {
      id: 'Ru2-Shoppage',
      name: 'Ru2-Shoppage',
      description: 'Shop page with sidebar filters and product grid',
      category: 'General',
      cover_image: ru2ShoppageSvg,
    },
    sections: ru2ShoppageSections,
  },
}

export function useThemes() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Ru1 Homepage Navbar', { defaults: ru1NavbarDefaults, fields: ru1NavbarFields, render: renderRu1Navbar })
  blockRegistry.register('Ru1 Homepage Hero', { defaults: ru1HeroDefaults, fields: ru1HeroFields, render: renderRu1Hero })
  blockRegistry.register('Ru1 Homepage Featured Products', { defaults: ru1ProductsDefaults, fields: ru1ProductsFields, render: renderRu1Products })
  blockRegistry.register('Ru1 Homepage Footer', { defaults: ru1FooterDefaults, fields: ru1FooterFields, render: renderRu1Footer })
  blockRegistry.register('Ru2 Shop Hero', { defaults: ru2ShopHeroDefaults, fields: ru2ShopHeroFields, render: renderRu2ShopHero })
  blockRegistry.register('Ru2 Shop Content', { defaults: ru2ShopContentDefaults, fields: ru2ShopContentFields, render: renderRu2ShopContent })

  async function applyTheme(themeId: string) {
    const theme = themeRegistry[themeId]
    if (!theme) return
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder()
    for (const section of [...theme.sections].reverse()) {
      await builder.addComponent(section)
    }
  }

  return { themeRegistry, applyTheme }
}
