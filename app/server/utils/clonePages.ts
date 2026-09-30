import { cloneDesignHtml } from './cloneDesign'
import { GLOBAL_OWNER_PAGES } from '../../composables/useGlobalSections'

export interface PageVersion {
  version: number
  updatedAt: string
  updatedBy: string
  status: string
  value: string
}

export interface Page {
  id: string
  name: string
  versions: PageVersion[]
  // Set by /api/pages when a company has no real saved record for this key
  // yet — the "version 1" shown is a synthesized display default, never
  // actually persisted. Must be treated as "doesn't exist" for version-
  // numbering, or the clone would skip straight to v2 leaving a confusing
  // gap where v1 never really existed.
  isDefault?: boolean
}

export interface CloneTarget {
  companyId: number
  pageKey: string
}

export interface CloneResult {
  companyId: number
  pageKey: string
  ok: boolean
  version?: number
  error?: string
}

// Clones one source page (sourceCompanyId/sourcePageKey) into every target
// {companyId, pageKey}. A target whose pageKey has no existing record on
// that company is created fresh at version 1 — same path as an existing
// page, no separate "create page" step. Shared by /api/pages/clone (single
// page, many targets) and /api/pages/clone-site (many pages, one target).
export async function cloneSourceToTargets(opts: {
  sourceCompanyId: number
  sourcePageKey: string
  sourceVersion?: number
  targets: CloneTarget[]
  cookie: string
  // Set to false to skip the global-header/global-footer bundle below even
  // when sourcePageKey is home/shop — used by /api/pages/clone-site, which
  // calls this once per page and must only bundle them once per batch, not
  // once per owner page it happens to clone.
  bundleGlobals?: boolean
  // Pass the source company's page list when the caller already fetched it
  // (e.g. /api/pages/clone-site, which fetches it once up front to build its
  // page-key list) to avoid re-fetching it on every call.
  sourcePages?: Page[]
}): Promise<CloneResult[]> {
  const { sourceCompanyId, sourcePageKey, sourceVersion, targets, cookie, bundleGlobals = true, sourcePages: preloadedSourcePages } = opts

  const fetchPages = (companyId: number) =>
    $fetch<Page[]>('/api/pages', { query: { companyId }, headers: { cookie } })

  // Fetches + sanitizes one source CMS key once. Returns null if the source
  // site has no record for this key (used to silently skip bundling
  // global-header/global-footer when the source site never had its own).
  async function fetchAndSanitize(
    key: string,
    version: number | undefined,
  ): Promise<{ sourcePage: Page; html: string } | null> {
    const sourcePages = preloadedSourcePages ?? await fetchPages(sourceCompanyId)
    const sourcePage = sourcePages.find((p) => p.id === key)
    if (!sourcePage) return null

    const sourceVersionData = version
      ? sourcePage.versions.find((v) => v.version === version)
      : sourcePage.versions[0] // /api/pages sorts newest-first already
    if (!sourceVersionData) return null

    return { sourcePage, html: cloneDesignHtml(sourceVersionData.value) }
  }

  // A page with no real record, or one that's only ever been a synthesized
  // isDefault placeholder, has no real version history to increment from.
  async function nextVersionFor(companyId: number, pageKey: string): Promise<number> {
    const targetPages = await fetchPages(companyId)
    const targetPage = targetPages.find((p) => p.id === pageKey)
    if (!targetPage || targetPage.isDefault || !targetPage.versions?.length) return 1
    return Math.max(...targetPage.versions.map((v) => v.version)) + 1
  }

  async function writeClone(html: string, companyId: number, pageKey: string, version: number, results: CloneResult[]): Promise<boolean> {
    try {
      await $fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        headers: { cookie },
        body: { key: pageKey, value: html, version: String(version), state: 'draft', companyId },
      })
      results.push({ companyId, pageKey, ok: true, version })
      return true
    } catch (err: any) {
      results.push({ companyId, pageKey, ok: false, error: err?.data?.message || err?.message || 'Clone failed' })
      return false
    }
  }

  const mainSource = await fetchAndSanitize(sourcePageKey, sourceVersion)
  if (!mainSource) {
    throw createError({ statusCode: 404, message: `Page "${sourcePageKey}" not found for source site` })
  }

  const results: CloneResult[] = []

  // Per target company, the version number the main page actually landed at
  // — reused as-is for global-header/global-footer below, instead of each
  // key computing its own separate number. Mirrors confirmSave()'s normal
  // manual-Save behavior (PageBuilderWrapper.client.vue), which always
  // saves home/global-header/global-footer under one shared version number.
  // Only populated when a target's pageKey matches the source page exactly
  // (home→home, shop→shop) AND that write actually succeeded — global-header/
  // global-footer must never be republished for a company just because some
  // other page (e.g. About, FAQ) was also cloned into it in the same request,
  // nor when the matching home/shop write itself failed (that would publish
  // a header/footer version with no corresponding page content behind it).
  const sharedVersionByCompany = new Map<number, number>()
  for (const target of targets) {
    // nextVersionFor does its own /api/pages fetch, separate from
    // writeClone's own try/catch — one bad target (unreachable companyId,
    // transient Odoo error) must not throw out of this loop and take the
    // whole request's response with it, silently discarding results
    // already recorded for every target processed before it.
    let version: number
    try {
      version = await nextVersionFor(target.companyId, target.pageKey)
    } catch (err: any) {
      results.push({
        companyId: target.companyId,
        pageKey: target.pageKey,
        ok: false,
        error: err?.data?.message || err?.message || 'Failed to look up target version',
      })
      continue
    }
    const wrote = await writeClone(mainSource.html, target.companyId, target.pageKey, version, results)
    if (wrote && target.pageKey === sourcePageKey) {
      sharedVersionByCompany.set(target.companyId, version)
    }
  }

  // home/shop are the only pages allowed to own the site-wide global-header/
  // global-footer records (see GLOBAL_OWNER_PAGES) — the navbar/footer are
  // never part of a page's own stored content, they're split into those
  // separate shared keys at save time. So cloning "home" alone would never
  // carry the navbar/footer design at all; bundling them in here mirrors
  // what a normal Save already does. Silently skipped per-target-site if
  // the source site has no header/footer of its own yet.
  if (bundleGlobals && GLOBAL_OWNER_PAGES.includes(sourcePageKey)) {
    for (const key of ['global-header', 'global-footer']) {
      // Same reasoning as nextVersionFor above — a fetch failure here (as
      // opposed to "source simply has no header/footer yet", which returns
      // null cleanly) must not abort the whole response after the main
      // page's targets already succeeded.
      let globalSource: Awaited<ReturnType<typeof fetchAndSanitize>>
      try {
        globalSource = await fetchAndSanitize(key, undefined) // always the source site's latest
      } catch (err: any) {
        for (const companyId of sharedVersionByCompany.keys()) {
          results.push({
            companyId,
            pageKey: key,
            ok: false,
            error: err?.data?.message || err?.message || `Failed to load source "${key}"`,
          })
        }
        continue
      }
      if (!globalSource) continue
      for (const [companyId, version] of sharedVersionByCompany) {
        await writeClone(globalSource.html, companyId, key, version, results)
      }
    }
  }

  return results
}
