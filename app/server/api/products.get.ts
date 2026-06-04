// GET /api/products?ids=1,2,3   (ids optional — omit to fetch all)
// Fetches products from Odoo GraphQL — keeps API key server-side.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.odooBaseUrl) {
    throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  }
  if (!config.odooGraphqlApiKey) {
    throw createError({ statusCode: 500, message: 'ODOO_GRAPHQL_API_KEY is not configured' })
  }

  const { ids: idsParam } = getQuery(event) as { ids?: string }
  const idList = idsParam ? idsParam.split(',').map(Number).filter(Boolean) : []
  const domain = idList.length ? [['id', 'in', idList]] : []

  const response = await fetch(`${config.odooBaseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.odooGraphqlApiKey}`,
    },
    body: JSON.stringify({
      query: `query products($domain: Any, $context: Any) { StoreProductTemplate(domain: $domain, order: "sequence asc", context: $context) { id name price image attributeValues { id name htmlColor displayType } } }`,
      variables: { domain, context: { allowed_company_ids: [3] } },
    }),
  })

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: `Odoo GraphQL error: ${response.statusText}` })
  }

  const json = await response.json()

  if (json.errors) {
    throw createError({ statusCode: 502, message: json.errors[0]?.message ?? 'GraphQL error' })
  }

  return json.data.products.StoreProductTemplate.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    colors: (product.attributeValues ?? [])
      .filter((av: any) => av.displayType === 'color' && av.htmlColor)
      .map((av: any) => ({ id: av.id, name: av.name, htmlColor: av.htmlColor })),
  }))
})
