import { useBlockRegistry } from '../editor/useBlockRegistry'
// All layout component data (interfaces, defaults, fields, render functions)
// lives in components.ts — add new components there, then register them below.
import {
  navbar1Defaults,
  navbar1Fields,
  navbar1Svg,
  renderNavbar1,
  ru1FormDefaults,
  ru1FormFields,
  ru1FormSvg,
  renderRu1Form,
  footer1Defaults,
  footer1Fields,
  footer1Svg,
  renderFooter1,
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
      cover_image: navbar1Svg,
      html_code: renderNavbar1(navbar1Defaults),
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
    defaults: navbar1Defaults,
    fields: navbar1Fields,
    render: renderNavbar1,
  })

  blockRegistry.register('Ru1-Form', {
    defaults: ru1FormDefaults,
    fields: ru1FormFields,
    render: renderRu1Form,
  })

  blockRegistry.register('Footer-1', {
    defaults: footer1Defaults,
    fields: footer1Fields,
    render: renderFooter1,
  })

  return { layoutComponentRegistry }
}
