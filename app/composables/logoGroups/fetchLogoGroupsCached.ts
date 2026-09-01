export type LogoGroupCategory = { id: number, name: string, displayName: string, headlessName?: string | false }
export type LogoGroupEntry = { groupName: string, categories: LogoGroupCategory[] }

// Client-only cache for GET /api/logo-groups, shared by loadLogoNav
// (rubikx-hydration.client.ts) and the EditorSidebar logo-group picker
// (openLogoPicker) — both call this instead of $fetch directly.
//
// This is safe to cache/TTL here in a way it is NOT safe to do on the
// server: this module's state lives in one browser tab, already scoped to
// exactly one visitor's own session/credentials by construction. The server
// endpoint was reverted away from response caching specifically because it
// is shared across every caller (different logged-in customers, different
// sites) and a companyId-only cache key let one caller's response leak to
// another's request — that risk doesn't exist here, since nobody else's
// browser can ever read this module's memory.
//
// Exists to absorb the same rehydration-burst problem that motivated the
// (reverted) server-side cache: Ru5-Dynamic-Navbar is one of EditorSidebar's
// REWIRE_ON_ANY_FIELD_TITLES entries, so editing ANY field on the block
// rehydrates the whole canvas ~150ms after every pause in typing, each pass
// re-triggering loadLogoNav's full paginated catalog scan. A short TTL here
// collapses that burst into one real network round trip while still
// re-fetching within seconds of it expiring.
const CACHE_TTL_MS = 30_000
const cache = new Map<string, { data: LogoGroupEntry[], expiresAt: number }>()
const inFlight = new Map<string, Promise<LogoGroupEntry[]>>()

export function fetchLogoGroupsCached(companyId?: number): Promise<LogoGroupEntry[]> {
  const key = companyId !== undefined ? String(companyId) : 'default'

  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.data)

  const pending = inFlight.get(key)
  if (pending) return pending

  const promise = $fetch<LogoGroupEntry[]>('/api/logo-groups', { query: { companyId } })
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
      return data
    })
    .finally(() => { inFlight.delete(key) })
  inFlight.set(key, promise)
  return promise
}
