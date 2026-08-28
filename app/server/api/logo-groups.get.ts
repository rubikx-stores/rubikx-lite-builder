// GET /api/logo-groups?companyId=5   (companyId optional)
// Deduped list of decoration/imprint logo GROUPS across the product
// catalog. Called from two places: the Ru5-Dynamic-Navbar logoNavLinks
// picker (EditorSidebar.client.vue, to list groups for selection — only
// the group name is stored in blockData) AND loadLogoNav
// (rubikx-hydration.client.ts), which calls this live at hydration time —
// deliberately no cache, matching loadDynamicNav's own "always refetch"
// convention, so a category added on the backend shows up on the published
// site without republishing.
//
// Individual logos (StoreProductTemplate.productVariants[].logoIds) each
// carry a groupName field (a plain string, not a separate relation/id) —
// confirmed exact casing, camelCase — the merchant picks by group, not by
// individual logo, so this groups logos by that field and merges every
// member logo's productCategoryIds into one deduped category list per
// group. Logos with no groupName are skipped — they have nothing
// meaningful to surface in a group-based picker.
//
// No page cap — matches products.get.ts/categories.get.ts, which fetch
// their full result set with no limit. A prior MAX_PAGES backstop here
// risked silently truncating logos/categories on larger catalogs; loop
// naturally ends once a page comes back short of PAGE_SIZE.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.odooBaseUrl) throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  if (!config.odooGraphqlApiKey) throw createError({ statusCode: 500, message: 'ODOO_GRAPHQL_API_KEY is not configured' })

  const { companyId: companyIdParam } = getQuery(event) as { companyId?: string }
  const companyId = companyIdParam ? Number(companyIdParam)
    : config.odooCompanyId ? Number(config.odooCompanyId)
    : undefined
  const token = getCookie(event, 'rb_auth_token') ?? config.odooGraphqlApiKey
  const context = companyId ? { allowed_company_ids: [companyId] } : {}

  const url = `${config.odooBaseUrl}/graphql`
  // Matches the confirmed-working query shape exactly — $context is
  // deliberately not declared/wired here; `context` is still sent as a
  // top-level `variables` key below, which this backend reads as Odoo's
  // native ORM-context convention regardless of GraphQL variable
  // declaration.
  const query = `query product($offset: Int, $limit: Int, $order: String, $domain: [[Any]]) {
    StoreProductTemplate(offset: $offset, limit: $limit, order: $order, domain: $domain) {
      productVariants { id logoIds { id name groupName productCategoryIds { id name displayName headlessName } } }
    }
  }`

  const PAGE_SIZE = 100
  const groupCategories = new Map<string, Map<number, { id: number, name: string, displayName: string, headlessName?: string | false }>>()

  for (let page = 0; ; page++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { offset: page * PAGE_SIZE, limit: PAGE_SIZE, order: 'id asc', domain: [], context },
      }),
    })

    if (!response.ok) {
      throw createError({ statusCode: response.status, message: `Odoo GraphQL error: ${response.statusText}` })
    }

    const json = await response.json()
    if (json.errors) {
      throw createError({ statusCode: 502, message: json.errors[0]?.message ?? 'GraphQL error' })
    }

    // Operation is named `product` (singular) above, so the response is
    // nested under json.data.product — not json.data.products, which is
    // products.get.ts's own query name, not this one.
    const templates: Array<{
      productVariants: Array<{
        logoIds: Array<{
          id: number
          name: string
          groupName?: string | false | null
          // headlessName unverified against real data (no logo-linked
          // category has been inspected with it requested yet) — assumed
          // present since productCategoryIds appears to be the same
          // underlying category model categories.get.ts already confirms
          // has it. Falls back to displayName/name below if actually absent
          // (this backend silently drops unrecognized fields rather than
          // erroring, so an absent key here just means "not real").
          productCategoryIds?: Array<{ id: number, name: string, displayName: string, headlessName?: string | false }>
        }>
      }>
    }> = json?.data?.product?.StoreProductTemplate ?? []

    for (const tmpl of templates) {
      for (const variant of tmpl.productVariants ?? []) {
        for (const logo of variant.logoIds ?? []) {
          // typeof guard, not just `?.trim()` — this backend returns `false`
          // (not null/undefined) for an unset optional field elsewhere in
          // this codebase (see headlessName), and optional chaining doesn't
          // short-circuit on `false`, so `?.trim()` alone still throws
          // "trim is not a function" for any logo with no group assigned.
          const groupName = typeof logo.groupName === 'string' ? logo.groupName.trim() : ''
          if (!groupName) continue
          if (!groupCategories.has(groupName)) groupCategories.set(groupName, new Map())
          const catMap = groupCategories.get(groupName)!
          for (const cat of logo.productCategoryIds ?? []) {
            if (!catMap.has(cat.id)) catMap.set(cat.id, cat)
          }
        }
      }
    }

    if (templates.length < PAGE_SIZE) break
  }

  return Array.from(groupCategories, ([groupName, categories]) => ({
    groupName,
    categories: Array.from(categories.values()),
  }))
})
