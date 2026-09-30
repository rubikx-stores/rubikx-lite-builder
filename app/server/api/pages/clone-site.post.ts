import { getHeader } from 'h3'
import { GLOBAL_OWNER_PAGES, INTERNAL_CMS_KEYS } from '../../../composables/useGlobalSections'
import { cloneSourceToTargets, type CloneResult, type Page } from '../../utils/clonePages'

interface CloneSiteBody {
  sourceCompanyId: number
  targetCompanyId: number
}

// Clones every real page Company A has onto Company B — page-by-page, in
// whatever set A actually has right now (no fixed/hardcoded page-key list),
// so pages new to A are picked up automatically and nothing needs updating
// here when the page catalog changes. A page B is missing gets created
// fresh; a page B already has gets overwritten with a new draft version
// (same per-page behavior as /api/pages/clone — never touches a published
// version, always lands as an unpublished draft to review/publish).
export default defineEventHandler(async (event): Promise<{ results: CloneResult[] }> => {
  const body = await readBody<CloneSiteBody>(event)

  if (!body?.sourceCompanyId || !body?.targetCompanyId) {
    throw createError({ statusCode: 400, message: 'sourceCompanyId and targetCompanyId are required' })
  }
  if (body.sourceCompanyId === body.targetCompanyId) {
    throw createError({ statusCode: 400, message: 'sourceCompanyId and targetCompanyId must be different sites' })
  }

  const cookie = getHeader(event, 'cookie') ?? ''

  const sourcePages = await $fetch<Page[]>('/api/pages', {
    query: { companyId: body.sourceCompanyId },
    headers: { cookie },
  })
  const pageKeys = sourcePages.map((p) => p.id).filter((id) => !INTERNAL_CMS_KEYS.has(id))

  const results: CloneResult[] = []
  // home and shop are both GLOBAL_OWNER_PAGES, and cloning either one also
  // bundles global-header/global-footer (see cloneSourceToTargets). A source
  // site can have both, but the bundle must only run once per site-clone
  // batch — not once per owner page — or header/footer get cloned twice as
  // two redundant draft versions.
  let globalsBundled = false
  for (const pageKey of pageKeys) {
    const isOwnerPage = GLOBAL_OWNER_PAGES.includes(pageKey)
    const bundleGlobals = isOwnerPage && !globalsBundled
    // One bad page (e.g. a transient Odoo error) must not abort the whole
    // site clone — collect its failure and keep going, same as the
    // per-target error handling inside cloneSourceToTargets.
    try {
      const pageResults = await cloneSourceToTargets({
        sourceCompanyId: body.sourceCompanyId,
        sourcePageKey: pageKey,
        targets: [{ companyId: body.targetCompanyId, pageKey }],
        cookie,
        bundleGlobals,
        sourcePages, // already fetched above — avoids re-fetching A's page list on every iteration
      })
      results.push(...pageResults)
      // Only mark the bundle as done if it actually ran — bundleGlobals is a
      // no-op inside cloneSourceToTargets when the owner page's own write
      // failed, so isOwnerPage alone isn't proof header/footer got copied.
      if (isOwnerPage && pageResults.some((r) => r.ok && (r.pageKey === 'global-header' || r.pageKey === 'global-footer'))) {
        globalsBundled = true
      }
    } catch (err: any) {
      results.push({
        companyId: body.targetCompanyId,
        pageKey,
        ok: false,
        error: err?.data?.message || err?.message || 'Clone failed',
      })
    }
  }

  return { results }
})
