# Ru1-Homepage Expanded Theme — Design Spec

> **Status:** Approved and implemented  
> **Date:** 2026-05-25

---

## Goal

Replace the original 4-section Ru1-Homepage theme with a complete 9-section premium eCommerce layout. Each section is fully independent — removing any one section from the page builder causes zero data loss to others.

## Architecture

All theme section HTML lives in a single data file (`composables/themes-data.ts`), separate from the registry logic (`composables/useThemes.ts`). This split keeps `useThemes.ts` lean and makes it trivial to add future themes: append arrays to `themes-data.ts`, register metadata in `useThemes.ts`. No new files needed per theme.

## Tech Stack

- Vue 3 + TypeScript (Nuxt 3)
- `@myissue/vue-website-page-builder` — section rendering engine (lib, untouched)
- `pbx-` prefixed Tailwind CSS classes — all styling
- Inline `style=""` attributes — gradients and one-off values not expressible via utility classes
- CSS-only interactivity — `hover:pbx-*` transitions, no inline JS, no `<style>` tags

## Constraints

- All changes in `/app` only — no changes to the page builder lib
- No inline `<script>` or `<style>` tags in section HTML (page builder convention)
- Each section wrapped in `<section data-component-title="Ru1 Homepage [Name]">` for builder identity
- Static layouts only — JS-dependent features (counter animation, carousel) replaced with equivalent static design

## Sections (9 total)

| # | Title | Key Features |
|---|---|---|
| 1 | Navbar | Sticky glassmorphism, centered search, nav links, cart badge, CTA, mobile hamburger |
| 2 | Hero | Two-column gradient, floating badges, mini stats row, gradient heading |
| 3 | Featured Cards | 4-col grid, gradient image placeholders, wishlist button, star ratings, category tags |
| 4 | Product Grid | Filter chips + sort dropdown (visual), 8 product cards, wishlist icons |
| 5 | Categories | 4 gradient category blocks with SVG icons and product counts |
| 6 | Stats | Indigo gradient band, 4 glassmorphism stat cards with icons |
| 7 | Testimonials | 3-card grid, avatar initials with gradient, role/company, star ratings |
| 8 | Newsletter | Dark gradient, decorative blurs, inline email form, social proof stats |
| 9 | Footer | 4-column, social icons (Twitter/LinkedIn/Instagram), contact info, copyright bar |

## File Map

| File | Role |
|---|---|
| `app/composables/themes-data.ts` | All theme section HTML arrays + `ThemeSection` interface + SVG cover |
| `app/composables/useThemes.ts` | Theme registry + `useThemes()` composable — imports data, no inline HTML |

## Adding Future Themes

```ts
// In themes-data.ts — add sections array:
export const myNewThemeSections: ThemeSection[] = [ /* ... */ ]

// In useThemes.ts — register metadata:
import { myNewThemeSections } from './themes-data'

export const themeRegistry: Record<string, Theme> = {
  'Ru1-Homepage': { /* existing */ },
  'my-new-theme': {
    meta: { id: 'my-new-theme', name: '...', description: '...', category: 'General', cover_image: '...' },
    sections: myNewThemeSections,
  },
}
```
