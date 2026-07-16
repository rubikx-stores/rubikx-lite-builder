import type { FieldConfig } from './useBlockRegistry'

export const FONT_FAMILY_OPTIONS = [
  '',
  'Inter, sans-serif',
  'Georgia, serif',
  "'Courier New', monospace",
  'Arial, sans-serif',
  "'Trebuchet MS', sans-serif",
  "'Segoe UI', sans-serif",
  'Verdana, sans-serif',
  'Poppins, sans-serif',
  "'Playfair Display', serif",
  'Oswald, sans-serif',
  'Caveat, cursive',
  "'Roboto Mono', monospace",
]

// Keep in sync with the 5 non-system fonts in FONT_FAMILY_OPTIONS above.
export const GOOGLE_FONTS_STYLESHEET_URL =
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=Oswald:wght@400;500;600&family=Caveat:wght@400;600&family=Roboto+Mono:wght@400;500&display=swap'

// Adds a font-family dropdown to a block's `fields` array.
export function fontField(key: string, label: string): FieldConfig {
  return { key, label, type: 'select', options: FONT_FAMILY_OPTIONS }
}

// Resolves the font-family CSS for one element: its own override wins,
// otherwise it falls back to the block's own default, otherwise nothing
// (the element just inherits, same as today).
export function fontCss(role: string | undefined, blockDefault: string | undefined): string {
  const value = role || blockDefault
  return value ? `font-family:${value};` : ''
}