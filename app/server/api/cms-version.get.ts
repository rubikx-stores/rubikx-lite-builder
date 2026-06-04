// GET /api/cms-version?key=homepage
// Fetches the saved HTML value for a single CMS page from Odoo.

const GRAPHQL_QUERY = `query MyQuery { RubikxCms { key value } }`

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event)

  if (!key) {
    throw createError({ statusCode: 400, message: 'key is required' })
  }

  const config = useRuntimeConfig(event)

  if (!config.odooBaseUrl) {
    throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  }
  if (!config.odooApiKey) {
    throw createError({ statusCode: 500, message: 'ODOO_API_KEY is not configured' })
  }

  const url = `${config.odooBaseUrl}/graphql`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    'X-API-Key': config.odooApiKey,
    Authorization: `Bearer ${config.odooApiKey}`,
  }

  if (config.odooAccessToken) {
    headers['Cookie'] = `access_token=${config.odooAccessToken}; frontend_lang=en_US`
  }

  const variables: Record<string, unknown> = {}
  if (config.odooCompanyId) {
    variables.context = { allowed_company_ids: [Number(config.odooCompanyId)] }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables }),
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Odoo error: ${response.statusText}`,
      data: responseText,
    })
  }

  const json = JSON.parse(responseText)
  const items: Array<{ key: string; value: string }> = json?.data?.RubikxCms ?? []
  const item = items.find((r) => r.key === key)

  return { html: item?.value ?? null }
})
