import type { FlatCategory } from './buildCategoryTree'

// Client-only cache for GET /api/categories, shared by every category
// consumer in rubikx-hydration.client.ts (loadCategories, loadDynamicNav) —
// all call this instead of $fetch directly. Same pattern/rationale as
// fetchLogoGroupsCached: safe to cache/TTL here in a way it is NOT safe to
// do on the server, since this module's state lives in one browser tab,
// already scoped to exactly one visitor's own session by construction.
//
// A block like Ru8-Navbar can carry several independent category-fetching
// shells at once — a desktop AND mobile element per navLink with its own
// dropdown enabled, plus the auto-generated Dynamic Categories row — and
// editing any field rehydrates the whole canvas, so each pause in typing
// re-triggers every one of those shells' own full catalog fetch
// simultaneously. Without this, that's N uncached, uncoordinated round
// trips to the same endpoint at once; with it, only the first caller in a
// given TTL window does the real fetch and every concurrent/later caller
// (same companyId) gets that same result.
//
// A per-element cache was previously tried directly inside loadDynamicNav
// and reverted — not because caching itself was wrong, but because it only
// benefited THAT one component while every other category shell on the page
// stayed fetch-driven, so it visibly populated first out of sync with
// everything else, and had no TTL/invalidation at all. Centralizing it here
// with a short TTL (shared by every consumer, same as logo groups) fixes
// both: every category shell benefits equally and consistently, and it
// still re-fetches within seconds of the TTL expiring rather than staying
// stale indefinitely or leaking one company's categories into another's
// navbar after a session-long company switch.
const CACHE_TTL_MS = 30_000
const cache = new Map<string, { data: FlatCategory[], expiresAt: number }>()
const inFlight = new Map<string, Promise<FlatCategory[]>>()

export function fetchCategoriesCached(companyId?: number): Promise<FlatCategory[]> {
  const key = companyId !== undefined ? String(companyId) : 'default'

  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.data)

  const pending = inFlight.get(key)
  if (pending) return pending

  const promise = $fetch<FlatCategory[]>('/api/categories', { query: { companyId } })
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
      return data
    })
    .finally(() => { inFlight.delete(key) })
  inFlight.set(key, promise)
  return promise
}
