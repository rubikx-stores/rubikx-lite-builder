# RubikX Lite Builder — Project Context

## Structure

Two-part monorepo:
- **Root (`/rubikx-lite-builder/`)** — Vue 3 library (`@myissue/vue-website-page-builder`), built with Vite in lib mode (UMD + ESM + types). Independently publishable to npm.
- **App (`/rubikx-lite-builder/app/`)** — Nuxt 3 host app (`rubikx-web`), the real RubikX storefront deployment. References the library via `file:../`.

Always build the library first before running the app:
```bash
pnpm run build:lib   # from root
```

## Key Files

| File | Purpose |
|------|---------|
| `app/composables/themes/themes-data.ts` | All Ru1-* block render functions (Navbar, Hero, Products, etc.) + their interfaces, defaults, and field configs |
| `app/composables/layouts/components.ts` | MegaMenuHeader, Footer, Stats, Image Carousel, Split Hero — render functions + interfaces, defaults, field configs |
| `app/plugins/rubikx-hydration.client.ts` | Client-side hydration plugin — HANDLERS map and all hydration functions |
| `app/server/api/auth/me.get.ts` | Auth endpoint — returns `{ user: { name, email } }` or 401 |
| `app/server/api/categories.get.ts` | Categories API — returns flat category list for dynamic nav |
| `app/server/api/products.get.ts` | Products API — used by mega menu |

## CSS / Class Naming Rules

- **Use `ru-` prefix** for all custom CSS classes (e.g. `ru-mega-item`, `ru-ptile`, `ru-pd`)
- **No `pbx-` prefix** — fully migrated away, do not introduce it anywhere
- **No Tailwind utility classes inside render functions** — use inline styles only. Tailwind is only for the builder UI shell, not for rendered block HTML
- **No `max-w-7xl`, `mx-auto`, etc.** in render functions — replace with `max-width:90rem;margin:0 auto`

## Hydration Shell Pattern

Dynamic elements in rendered HTML are wrapped in a shell element:
```html
<span
  data-rubikx-component="ComponentName"
  data-on-mount="handlerFunctionName"
  data-some-prop="value"
  style="position:relative;display:inline-flex;"
>
  <!-- static fallback content rendered server-side -->
</span>
```

`hydrateComponents()` in the plugin picks these up on page load and calls the matching handler.

### Registered handlers (HANDLERS map in rubikx-hydration.client.ts)

| Handler | Component | What it does |
|---------|-----------|-------------|
| `loadCategories` | `CategoryNav` | Fetches `/api/categories`, renders category tree or mega-grid into dropdown |
| `loadRu10CategoryLinks` | `Ru10ShopByCategory` | Fetches `/api/categories`, rewrites each category card's href by matching its name against the live top-level category list (no admin-entered URL field) |
| `loadSlider` | `HeroSlider` | Wires up slide transitions, dots, prev/next, autoplay |
| `loadCartCount` | `CartBadge` | Injects red badge with cart count (demo: hardcoded 3; TODO: real Odoo API) |
| `loadAuthState` | `AuthState` | Fetches `/api/auth/me` — logged in → shows profile icon + dropdown; logged out → shows sign-in link |

### Category banners (`category-banners` CMS entry)

Ru10 card **descriptions** (rich text, inline styles) become the banner shown atop `/shop?category=<name>` on the live store:
- Written by `publishPage()` (`app/pages/index.vue`) **only when publishing `home`** — one site-wide record, value = JSON `{ "<card name>": "<description HTML>" }`, built by `buildCategoryBannersValue()` in `composables/useGlobalSections.ts`. Stored exactly as authored (no heading/wrapper added). Once a site has a `category-banners` row it's rewritten on every home publish, even as `"{}"` (the CMS proxy rejects an empty string), so clearing a description clears the banner. Sites that never used banners (no row, nothing to publish) skip the write entirely (`bannersWorthWriting()` in `index.vue`).
- Key = the card's `name` (synced as `headlessName || displayName || name`) = the `?category=` value `loadRu10CategoryLinks` puts in the link. The description is **not** in the URL.
- Lifecycle: demoted in `unpublishPage()`, removed via `CASCADE_MAP.home` in `server/api/pages/[...key].delete.ts`, hidden from page lists/clone (`GLOBAL_KEYS` in `index.vue`, `INTERNAL_CMS_KEYS`). Rebuilt from the cloned home on the target site's next publish.

### Builder guard

Every handler that mutates the live DOM must bail out inside the page builder:
```ts
if (document.getElementById('page-builder-wrapper')) return
```

## AuthState Handler Details

- Profile icon: Heroicons v2 `user` outline (`M15.75 6a3.75 3.75 0 1 1-7.5 0 ...`)
- Dropdown: "My Profile" → `/me/personal`, "Sign Out" → `/logout`
- Idempotent: removes `[data-auth-profile]` and `[data-auth-dropdown]` before re-injecting
- Outside-click closes dropdown via `document.addEventListener('click', ...)`

## NavBar Blocks

### Ru1Navbar (`themes-data.ts` → `renderRu1Navbar`)
- Simple navbar: logo, static nav links, optional dynamic categories, search, sign-in (AuthState shell), contact us, cart (CartBadge shell)
- Layout: 3-column CSS grid (`1fr 1fr 1fr`), zones: left / center / right
- `navLinksAlign` supports `lower-left/center/right` for a second row

### MegaMenuHeader (`layouts/components.ts` → `renderMegaMenuHeader`)
- Full mega menu navbar with per-link product dropdowns, dynamic categories, search, CTA buttons, AuthState shell, CartBadge shell
- Layout: 3-column grid, `max-width:80rem;margin:0 auto;width:100%` (no Tailwind)
- `showSignIn: false` by default — `ctaButtons` already has a static Sign In button; enable `showSignIn` only when you want the live auth-aware shell
- `showCart: true` by default

## Integrations

| Service | Env Var | Route |
|---------|---------|-------|
| Odoo CMS | `ODOO_BASE_URL`, `ODOO_API_KEY` | `/api/proxy/odoo/cms` |
| Unsplash | `UNSPLASH_ACCESS_KEY` | `/api/proxy/unsplash` |
| Generic backend | `API_BASE_URL` | `/api/proxy/[...path]` |

## Deployment

- Platform: AWS Amplify (`amplify.yml`), `NITRO_PRESET=aws-amplify`
- Staging branch: `develop`
- Feature branches PR into `develop`, not `main`

## Commit / PR conventions

- Use `rtk` prefix for all shell commands (token savings)
- PRs target `develop` branch (our staging branch)
- Commit style: `feat:` / `fix:` with a short body describing the why
