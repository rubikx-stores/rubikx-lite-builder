// GET /api/logos?companyId=5   (companyId optional)
// Deduped list of decoration/imprint logos across the product catalog, for
// the Ru5-Dynamic-Navbar logoNavLinks picker (EditorSidebar.client.vue).
// Logos live on StoreProductTemplate.productVariants[].logoIds — there's no
// dedicated "logos" model/endpoint on the Odoo side, so this paginates the
// product catalog and flattens+dedupes every variant's logoIds client-side.
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
  // Matches the confirmed-working query exactly — note $context is NOT
  // declared here and StoreProductTemplate's field args don't include a
  // context: $context wiring, unlike categories.get.ts/products.get.ts's own
  // queries. `context` is still sent below as a top-level key in the
  // `variables` payload (confirmed working that way against live data) —
  // this Odoo GraphQL layer appears to read `context` as Odoo's native
  // ORM-context convention regardless of whether the operation declares it
  // as a GraphQL variable, rather than requiring standard $var binding.
  const query = `query product($offset: Int, $limit: Int, $order: String, $domain: [[Any]]) {
    StoreProductTemplate(offset: $offset, limit: $limit, order: $order, domain: $domain) {
      productVariants { id logoIds { id name } }
    }
  }`

  const PAGE_SIZE = 100
  const MAX_PAGES = 20
  const logos = new Map<number, string>()

  for (let page = 0; page < MAX_PAGES; page++) {
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
    const templates: Array<{ productVariants: Array<{ logoIds: Array<{ id: number, name: string }> }> }> =
      json?.data?.product?.StoreProductTemplate ?? []

    for (const tmpl of templates) {
      for (const variant of tmpl.productVariants ?? []) {
        for (const logo of variant.logoIds ?? []) {
          if (!logos.has(logo.id)) logos.set(logo.id, logo.name)
        }
      }
    }

    if (templates.length < PAGE_SIZE) break
  }

  return Array.from(logos, ([id, name]) => ({ id, name }))
})
