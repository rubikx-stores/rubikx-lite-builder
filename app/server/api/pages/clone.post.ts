import { getHeader } from 'h3'
import { cloneDesignHtml } from '../../utils/cloneDesign'
import { GLOBAL_OWNER_PAGES } from '../../../composables/useGlobalSections'

interface PageVersion {
  version: number
  updatedAt: string
  updatedBy: string
  status: string
  value: string
}

interface Page {
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

interface CloneTarget {
  companyId: number
  pageKey: string
}

interface CloneBody {
  sourceCompanyId: number
  sourcePageKey: string
  sourceVersion?: number
  targets: CloneTarget[]
}

interface CloneResult {
  companyId: number
  pageKey: string
  ok: boolean
  version?: number
  error?: string
}

export default defineEventHandler(async (event): Promise<{ results: CloneResult[] }> => {
  const body = await readBody<CloneBody>(event)

  if (!body?.sourceCompanyId || !body?.sourcePageKey || !Array.isArray(body?.targets) || body.targets.length === 0) {
    throw createError({ statusCode: 400, message: 'sourceCompanyId, sourcePageKey and at least one target are required' })
  }

  // Forward the session cookie so the downstream /api/pages and
  // /api/proxy/odoo/cms calls see the same authenticated user this request
  // came in as (both read rb_auth_token from the cookie header).
  const cookie = getHeader(event, 'cookie') ?? ''

  const fetchPages = (companyId: number) =>
    $fetch<Page[]>('/api/pages', { query: { companyId }, headers: { cookie } })

  // Fetches + sanitizes one source CMS key once. Returns null if the source
  // site has no record for this key (used to silently skip bundling
  // global-header/global-footer when the source site never had its own).
  async function fetchAndSanitize(
    sourcePageKey: string,
    sourceVersion: number | undefined,
  ): Promise<{ sourcePage: Page; html: string } | null> {
    const sourcePages = await fetchPages(body.sourceCompanyId)
    const sourcePage = sourcePages.find((p) => p.id === sourcePageKey)
    if (!sourcePage) return null

    const sourceVersionData = sourceVersion
      ? sourcePage.versions.find((v) => v.version === sourceVersion)
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

  const mainSource = await fetchAndSanitize(body.sourcePageKey, body.sourceVersion)
  if (!mainSource) {
    throw createError({ statusCode: 404, message: `Page "${body.sourcePageKey}" not found for source site` })
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
  for (const target of body.targets) {
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
    if (wrote && target.pageKey === body.sourcePageKey) {
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
  if (GLOBAL_OWNER_PAGES.includes(body.sourcePageKey)) {
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

  return { results }
})
