export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, message: 'key is required' })

  const PROTECTED_KEYS = ['global-header', 'global-footer', 'global-theme']
  if (PROTECTED_KEYS.includes(key)) {
    throw createError({ statusCode: 403, message: `Cannot delete protected key: ${key}` })
  }

  const config = useRuntimeConfig(event)
  const ODOO_URL = `${config.odooBaseUrl}/graphql`
  const token = getCookie(event, 'rb_auth_token') ?? config.odooGraphqlApiKey

  const { companyId: companyIdParam, version: versionParam, versions: versionsParam } = getQuery(event) as { companyId?: string, version?: string, versions?: string }
  const companyId = companyIdParam ? Number(companyIdParam) : undefined
  // `versions` (comma-separated) scopes deletion to that specific set,
  // e.g. from checkbox-selected rows in the delete modal; the singular
  // `version` remains supported as a one-off shorthand. Omitting both
  // deletes every version row sharing this key.
  const versionList = versionsParam
    ? versionsParam.split(',').map(Number).filter((n) => !Number.isNaN(n))
    : versionParam !== undefined ? [Number(versionParam)] : undefined

  const fetchRes = await $fetch<any>(ODOO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: {
      query: `query MyQuery($context: Any) { RubikxCms(context: $context) { id key state version } }`,
      variables: { context: companyId ? { allowed_company_ids: [companyId] } : {} }
    }
  })

  const allRecords = fetchRes?.data?.MyQuery?.RubikxCms ?? []
  const pageRecords = allRecords.filter((r: any) => r.key === key)

  if (pageRecords.length === 0) {
    throw createError({ statusCode: 404, message: `No records found for key: ${key}` })
  }

  // A published row is deletable either way — the "unpublish first"
  // decision is a frontend warning, not a backend gate.
  const recordsToDelete = versionList
    ? pageRecords.filter((r: any) => versionList.includes(r.version))
    : pageRecords

  if (recordsToDelete.length === 0) {
    throw createError({ statusCode: 404, message: `No record found for key: ${key}, version(s): ${versionList?.join(',')}` })
  }

  const idsToDelete = recordsToDelete.map((r: any) => r.id)

  console.log('[CMS DELETE] key:', key, 'versionList:', versionList, 'companyId:', companyId,
    'recordsToDelete:', recordsToDelete.map((r: any) => ({ id: r.id, version: r.version, state: r.state })))

  // Home's navbar/footer are saved under global-header/global-footer, and
  // Shop's own banner is saved under shop-header/shop-footer (see
  // splitShopSectionsForPublish in useGlobalSections.ts — the live storefront
  // never reads the plain "shop" key at all), both at the exact same version
  // number as the owning page's save (see PageBuilderWrapper.client.vue's
  // shared commonBody.version / index.vue's commonFields.version). So
  // deleting a version of one of these owner pages should take its matching
  // cascade-target version with it — those targets are otherwise permanently
  // protected above (global-header/global-footer) or simply never read
  // directly (shop), so they'd never follow the owner page's deletions on
  // their own.
  const CASCADE_MAP: Record<string, string[]> = {
    home: ['global-header', 'global-footer'],
    shop: ['shop-header', 'shop-footer'],
  }
  const CASCADE_TARGET_KEYS = CASCADE_MAP[key] ?? []
  // Number(...) on both sides — GraphQL/Odoo isn't guaranteed to return
  // `version` as the same JS type across every query, and a silent
  // string/number mismatch here would just match nothing with no error.
  const deletedVersionNumbers = recordsToDelete.map((r: any) => Number(r.version))
  // Once this delete leaves zero records of the owner page at all, it's
  // completely gone — at that point clear every cascade-target version that
  // exists, not just the one(s) matching versions deleted right now. This
  // also self-heals orphaned cascade rows left over from owner-page versions
  // deleted before this cascade existed (their matching row was never
  // cleaned up at the time, so it just sat there permanently outranking
  // everything else by version number).
  const isOwnerKeyNowFullyEmpty = CASCADE_TARGET_KEYS.length > 0 && recordsToDelete.length === pageRecords.length
  const cascadeRecords = CASCADE_TARGET_KEYS.length === 0
    ? []
    : isOwnerKeyNowFullyEmpty
      ? allRecords.filter((r: any) => CASCADE_TARGET_KEYS.includes(r.key))
      : allRecords.filter((r: any) => CASCADE_TARGET_KEYS.includes(r.key) && deletedVersionNumbers.includes(Number(r.version)))
  const cascadeIds = cascadeRecords.map((r: any) => r.id)
  const allIdsToDelete = [...idsToDelete, ...cascadeIds]

  console.log('[CMS DELETE] isOwnerKeyNowFullyEmpty:', isOwnerKeyNowFullyEmpty, 'cascade candidates:',
    cascadeRecords.map((r: any) => ({ id: r.id, key: r.key, version: r.version, state: r.state })))

  await Promise.all(
    allIdsToDelete.map((id: number) =>
      $fetch<any>(ODOO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: {
          query: `mutation Delete { deleteRubikxCms: RubikxCms(id: ${id}) }`,
          variables: { context: companyId ? { allowed_company_ids: [companyId] } : {} }
        }
      })
    )
  )

  // Cache-bust: a bare delete never tells Odoo to refresh what it serves
  // live for a key — confirmed via testing, the live site only actually
  // updates once a fresh record is PUBLISHED back, not from a delete
  // alone. As long as another published row survives for a key, Odoo
  // naturally falls back to rendering that one on its own — no action
  // needed. Only once zero published rows remain, publish an explicit
  // "cleared" sentinel (same pattern already used for shop-header/
  // shop-footer in useGlobalSections.ts) to force Odoo to refresh, then
  // immediately delete that record again so the key stays truly empty —
  // no default content is written back anywhere; this is a real delete,
  // not a reset.
  const cacheBustCleared = async (targetKey: string) => {
    try {
      await $fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: {
          key: targetKey,
          value: '<!-- cleared -->',
          version: '1',
          state: 'published',
          ...(companyId ? { companyId } : {}),
        },
      })
      const refetchRes = await $fetch<any>(ODOO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: {
          query: `query MyQuery($context: Any) { RubikxCms(context: $context) { id key state version } }`,
          variables: { context: companyId ? { allowed_company_ids: [companyId] } : {} }
        }
      })
      const freshRecords = refetchRes?.data?.MyQuery?.RubikxCms ?? []
      const clearedIds = freshRecords.filter((r: any) => r.key === targetKey).map((r: any) => r.id)

      await Promise.all(clearedIds.map((id: number) =>
        $fetch<any>(ODOO_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: {
            query: `mutation Delete { deleteRubikxCms: RubikxCms(id: ${id}) }`,
            variables: { context: companyId ? { allowed_company_ids: [companyId] } : {} }
          }
        })
      ))
      console.log('[CMS DELETE] cache-bust cleared key:', targetKey, 'ids:', clearedIds)
    } catch (err) {
      console.error('[CMS DELETE] cache-bust failed for key:', targetKey, err)
    }
  }

  // Odoo resolves what to render for a key by querying live for the current
  // `published` row, not from some cache that only refreshes on a write — so
  // as long as another published row survives, Odoo naturally falls back to
  // it with no action needed here. The cache-bust is only required once
  // *zero published rows* remain for a key — otherwise Odoo just keeps
  // serving its last rendered output for the row(s) we removed. Gating this
  // on zero rows total (as before) missed the common case where draft rows
  // survive alongside the deleted published one.
  const keysNeedingCacheBust = CASCADE_TARGET_KEYS.filter((gk) => {
    const existedBefore = allRecords.some((r: any) => r.key === gk)
    const remainingPublished = allRecords.filter((r: any) =>
      r.key === gk && r.state === 'published' && !cascadeIds.includes(r.id)
    ).length
    return existedBefore && remainingPublished === 0
  })
  console.log('[CMS DELETE] cascade-target keys needing cache-bust:', keysNeedingCacheBust)
  for (const gk of keysNeedingCacheBust) await cacheBustCleared(gk)

  // Same treatment for the page's own key (home or any other page): only
  // once every remaining row for it is no longer published.
  const remainingPublished = pageRecords.filter((r: any) =>
    r.state === 'published' && !idsToDelete.includes(r.id)
  ).length
  if (remainingPublished === 0) await cacheBustCleared(key)

  return { deleted: allIdsToDelete.length, ids: allIdsToDelete }
})
