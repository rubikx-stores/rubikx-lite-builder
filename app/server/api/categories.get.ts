const GRAPHQL_QUERY = `
query RubikxProductPublicCategory($context: Any) {
  RubikxProductPublicCategory(order: "sequence asc", context: $context) {
    id name displayName sequence headlessName isPublicCategory parentId
  }
}
`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.odooBaseUrl) throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  if (!config.odooGraphqlApiKey) throw createError({ statusCode: 500, message: 'ODOO_GRAPHQL_API_KEY is not configured' })

  const url = `${config.odooBaseUrl}/graphql`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    Authorization: `Bearer ${config.odooGraphqlApiKey}`,
  }

  if (config.odooAccessToken) {
    headers['Cookie'] = `access_token=${config.odooAccessToken}; frontend_lang=en_US`
  }

  const variables = { context: { allowed_company_ids: [3] } }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables }),
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Odoo error: ${response.statusText}`,
    })
  }

  const json = await response.json()
  // TODO: confirm exact parent field name with backend
  const items: Array<{
    id: number
    name: string
    displayName: string
    sequence: number
    headlessName: string
    isPublicCategory: boolean
    parentId?: number | null
  }> = json?.data?.RubikxProductPublicCategory?.RubikxProductPublicCategory ?? []

  const seen = new Set<number>()
  return items
    .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
    .map(c => ({
      id: c.id,
      name: c.name,
      displayName: c.displayName,
      headlessName: c.headlessName,
      parentId: c.parentId ?? null,
    }))
})
