# Helper Components — Proper Editable Blocks

**Date:** 2026-07-16
**Status:** Design Review
**Scope:** Give all 11 "Helper Components" (Text, Header H2–H6, YouTube Video, Break Divider, Left/Centered/Right Positioned Button) a real right-panel field editor, matching how every other block (Ru1-Navbar, Ru1-Banner, etc.) already works.

## Problem

The Helper Components picker (`app/components/builder/BuilderPanel.client.vue:325-340`) lists 11 cards backed by `src/utils/html-elements/componentHelpers.ts` — each just a static HTML string with a title and icon:

```ts
interface ComponentHelper {
  html_code: string
  id: string | null
  title: string
  icon: string
}
```

There's no `defaults`/`fields`/`render` for any of them. The right-panel field editor (`app/components/builder/EditorSidebar.client.vue`) only shows a structured "block" editor when the selected element's `data-component-title` matches an entry in `blockRegistry` (`app/composables/editor/useBlockRegistry.ts`) — registered today only for the Ru1-*/Ru2-* themed blocks (e.g. `blockRegistry.register('Ru1-Banner', { defaults, fields, render })` in `useLayouts.ts`). Since none of the 11 helper titles are registered, dropping one falls back to the generic "element" editor (basic typography/color/background) instead of a real per-block panel.

## Approach

Add app-side registry entries for all 11 titles — no changes to the library (`src/`). This keeps every custom block (including these) in the app, consistent with how Ru1-*/Ru2-* blocks already work, and keeps font customization (`fontField`/`fontCss`, app-only) available to them.

1. **New file `app/composables/helpers/helperBlocks.ts`** — for each of the 11 titles, define `{interface, defaults, fields, render}` following the exact contract used by `Ru1-Banner` (`app/composables/layouts/components.ts:1729-1854`): `render(data)` returns a self-describing `<section data-component-title="..." data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="...">...</section>`.

   To avoid duplicating near-identical code:
   - **Headers (H2–H6)** share one factory (e.g. `makeHeaderBlock(tag, defaultFontSize)`) since all 5 have identical fields and differ only by tag name and default size.
   - **Buttons (Left/Centered/Right)** share one factory (e.g. `makeButtonBlock(justify)`) since all 3 have identical fields and differ only by default `justify-content`.
   - Text, YouTube Video, and Break Divider are one-off (no shared structure with anything else).

2. **New file `app/composables/helpers/useHelperBlocks.ts`** — registers all 11 with `blockRegistry.register(title, config)`, mirroring the pattern in `useThemes.ts`/`useLayouts.ts`. Called from wherever those two are already invoked at app startup.

3. **Small override in `BuilderPanel.client.vue`** — today it imports `componentHelpers` straight from the library (`#lib/componentHelpers`) and uses each entry's static `html_code` as-is when a card is clicked. Add a title-keyed override map so these 11 cards insert `render(defaults)` instead of the library's static string — making every freshly-dropped instance self-describing from the very first drop (matching how every other block already behaves; without this, the first field edit would abruptly replace the static placeholder content with the registry defaults, a jarring "jump").

No changes needed to `EditorSidebar.client.vue` or `useEditorSidebar.ts` — the existing `data-component-title` → `blockRegistry` matching already does the rest once these 11 are registered.

## Component Field Specs

### Text
- `content` (textarea) — body text
- `fontFamily` (fontField), `fontSize` (number, px), `fontWeight` (select: 400/500/600/700)
- `color` (color)
- `textAlign` (select: left/center/right)
- `paddingY` (number, px)

### Header H2 / H3 / H4 / H5 / H6
*(identical fields for all 5, built via a shared factory — only the tag and default `fontSize` differ)*
- `content` (text) — heading text
- `fontFamily` (fontField), `fontSize` (number, px), `fontWeight` (select: 400/500/600/700)
- `color` (color)
- `textAlign` (select: left/center/right)
- `paddingY` (number, px)

### YouTube Video
- `videoUrl` (text/url) — full YouTube URL or video ID
- `aspectRatio` (select: `16/9`, `4/3`, `1/1`, `9/16`, `21/9`) — converted to a padding-top percentage for a responsive box, same technique as `Ru1Hero`'s `aspectRatio` (`themes-data.ts:470-478`, `ru1HeroRatioPercent`)
- `extraHeight` (number, px) — added on top of the ratio-computed height via `calc()`, same idea as `Ru1Hero`'s `extraHeight` field (that one uses `cm`; this uses `px`, more conventional for embeds)
- `paddingY` (number, px)

### Break Divider
- `color` (color)
- `thickness` (number, px)
- `width` (number, %)
- `spacing` (number, px) — vertical margin above and below the line

### Left Positioned Button / Centered Button / Right Positioned Button
*(identical fields for all 3, built via a shared factory — alignment (`justify-content: flex-start/center/flex-end`) fixed per variant, not user-editable, to preserve the 3 distinct picker cards)*
- `label` (text)
- `href` (url)
- `fontFamily` (fontField), `fontSize` (number, px), `fontWeight` (select: 400/500/600/700)
- `textColor` (color)
- `bgColor` (color)
- `paddingX` (number, px), `paddingY` (number, px) — controls button size directly (grows/shrinks around the label)

## Files to Modify / Add

1. **Add** `app/composables/helpers/helperBlocks.ts` — interfaces, defaults, fields, render functions for all 11 blocks (2 shared factories + 3 one-offs)
2. **Add** `app/composables/helpers/useHelperBlocks.ts` — registers all 11 in `blockRegistry`
3. **Modify** `app/components/builder/BuilderPanel.client.vue` — override map so Helper Components cards insert `render(defaults)` instead of the library's static `html_code`
4. **No changes** to `src/` (library) or `EditorSidebar.client.vue`/`useEditorSidebar.ts`

## Testing

1. Drop each of the 11 helper blocks onto the canvas — right panel should show the structured field editor immediately (not the generic element editor)
2. Edit each field per block and confirm the canvas updates and `data-component-props` stays in sync
3. YouTube Video: confirm aspect ratio presets compute the expected box height, and `extraHeight` adds on top correctly
4. Buttons: confirm `paddingX`/`paddingY` resize the button, and each of the 3 variants keeps its own fixed alignment
5. Save/publish a page containing these blocks and reload — confirm saved field values persist (via `data-component-props`) rather than reverting to defaults

## Success Criteria

- ✅ All 11 Helper Components have a dedicated right-panel field editor, matching the UX of existing Ru1-*/Ru2-* blocks
- ✅ Headers and Buttons share implementation via factories — no 5x/3x code duplication
- ✅ YouTube Video's aspect ratio + extra-height follows the `Ru1Hero` pattern
- ✅ Buttons are resizable via padding X/Y
- ✅ No changes required to the library (`src/`) or the generic sidebar/registry machinery
