# Featured Product Name Single-Line Truncation

## Problem

In `Ru1 Homepage Featured Products` (`renderRu1Products`, `app/composables/themes/themes-data.ts:685`), the product name renders as a plain `<p>${p.name}</p>` with no line constraint (`themes-data.ts:779`). Short names take 1 line; long names wrap to 2. Because cards sit in a grid row, this makes the name block a different height per card — so the price row and color swatches beneath it (rendered right after in the same flex column) end up misaligned vertically across cards in the same row.

## Fix

Constrain the product name `<p>` to always render exactly 1 line, truncating overflow with an ellipsis (`…`). Add to the existing inline style at `themes-data.ts:779`:

```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

No JS, no markup changes, no new props, no tooltip.

## Why this achieves alignment

The card's inner content wrapper is `display:flex; flex-direction:column` (`themes-data.ts:778`). With default `align-items: stretch`, the name `<p>` already stretches to the card's full width. Clamping it to 1 line at a fixed font-size makes the name block the same height in every card regardless of product name length. Since price and swatches follow immediately after in the same flex column, they land at the same vertical offset in every card — keeping the row horizontally aligned.

## Scope

Only `renderRu1Products`. No other render function (Ru2/Ru3 themes, `layouts/components.ts`, etc.) is touched.

## Edge cases

- Short names: unaffected, unchanged rendering.
- Long names: cut with `…` at the card's edge, no wrap/overflow.
- Placeholder product (`'Product Name'`): unaffected, already short.
