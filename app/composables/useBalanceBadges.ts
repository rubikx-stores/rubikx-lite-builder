import type { FieldConfig } from './editor/useBlockRegistry'
import { icon } from './useIconSvg'

// Navbar "wallet" balances (gift card / budget). The builder only emits a
// marker; the storefront (default.vue → mountCmsBalanceBadges) fills it from
// the logged-in user's data and hides it when the site/user has nothing to
// show. `data-show` is what THIS navbar allows — the site data still decides
// what actually appears.
export type BalanceBadgesMode = 'off' | 'gift' | 'budget' | 'both'

export const balanceBadgesDefaults: BalanceBadgesData = {
  balanceBadges: 'off',
  balanceIconColor: '#111827',
  balancePillBgColor: '#ffffff',
  balancePillTextColor: '#000000',
}

export const balanceBadgesFields: FieldConfig[] = [
  {
    key: 'balanceBadges',
    label: 'Show Balance (Gift Card / Budget)',
    type: 'select',
    options: ['off', 'gift', 'budget', 'both'],
  },
  { key: 'balanceIconColor', label: 'Balance Icon Colour', type: 'color' },
  { key: 'balancePillBgColor', label: 'Balance Pill Background', type: 'color' },
  { key: 'balancePillTextColor', label: 'Balance Pill Text Colour', type: 'color' },
]

// Static preview so the builder canvas shows where the badges sit. The
// storefront mount replaces this content with the real balances (and hides
// the marker when the site/user has nothing to show).
export interface BalanceBadgesData {
  balanceBadges: BalanceBadgesMode
  balanceIconColor: string
  balancePillBgColor: string
  balancePillTextColor: string
}

function previewPill(
  label: string,
  iconName: 'gift' | 'wallet',
  compact: boolean,
  c: { icon: string; bg: string; text: string },
): string {
  const pill = compact
    ? 'font-size:0.8125rem;padding:0.125rem 0.5rem;'
    : 'font-size:0.875rem;padding:0.25rem 0.75rem;'
  return `<span title="${label}" aria-label="${label}" style="display:inline-flex;align-items:center;gap:0.5rem;color:${c.icon};">${icon(iconName, { size: compact ? 20 : 24 })}<span style="display:inline-flex;align-items:center;background:${c.bg};color:${c.text};border:1px solid #e5e7eb;border-radius:9999px;font-weight:600;white-space:nowrap;${pill}">$0.00</span></span>`
}

export function renderBalanceBadges(
  data: BalanceBadgesData,
  size: 'default' | 'compact' = 'default',
  // Spacing goes on the marker itself (not a wrapper) so it disappears with
  // the marker when the storefront hides it (guests / nothing to show).
  extraStyle = '',
): string {
  const mode = data.balanceBadges
  if (mode !== 'gift' && mode !== 'budget' && mode !== 'both') return ''
  const compact = size === 'compact'
  const c = {
    icon: data.balanceIconColor || balanceBadgesDefaults.balanceIconColor,
    bg: data.balancePillBgColor || balanceBadgesDefaults.balancePillBgColor,
    text: data.balancePillTextColor || balanceBadgesDefaults.balancePillTextColor,
  }
  const pills = [
    mode !== 'budget' ? previewPill('Gift card balance', 'gift', compact, c) : '',
    mode !== 'gift' ? previewPill('Budget balance', 'wallet', compact, c) : '',
  ].join('')
  return `<div data-rubikx-component="BalanceBadges" data-show="${mode}" data-size="${size}" data-text-color="${c.icon}" data-pill-bg="${c.bg}" data-pill-text="${c.text}" style="display:inline-flex;align-items:center;gap:0.75rem;flex-shrink:0;${extraStyle}">${pills}</div>`
}
