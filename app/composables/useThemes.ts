import { type ThemeSection, ru1TechwireSections, ru1TechwireSvg } from './themes-data'

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
    for (const section of [...theme.sections].reverse()) {
      await builder.addComponent(section)
    }
  }
  return { themeRegistry, applyTheme }
}
