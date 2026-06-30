import { getCookie, getQuery } from 'h3'

const GRAPHQL_QUERY = `query MyQuery { RubikxCms { key version state updatedBy updatedOn value } }`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.odooBaseUrl) {
    throw createError({
      statusCode: 500,
      message: 'ODOO_BASE_URL is not configured',
    })
  }
  if (!config.odooApiKey) {
    throw createError({
      statusCode: 500,
      message: 'ODOO_API_KEY is not configured',
    })
  }

  const companyId = Number(getQuery(event).companyId) || undefined
  const token = getCookie(event, 'rb_auth_token') ?? config.odooApiKey
  if (!token) {
    throw createError({ statusCode: 401, message: 'No auth token and ODOO_API_KEY is not configured' })
  }

  const url = `${config.odooBaseUrl}/graphql`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  if (config.odooAccessToken) {
    headers['Cookie'] =
      `access_token=${config.odooAccessToken}; frontend_lang=en_US`
  }

  const variables = companyId
    ? { context: { allowed_company_ids: [companyId] } }
    : {}

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
  const items: Array<{
    key: string
    version: number
    state: string
    updatedBy: string
    updatedOn: string
    value: string
  }> = json?.data?.MyQuery?.RubikxCms ?? []

  console.log('[CMS GET] companyId:', companyId, 'records:', items.length, items.map(i => ({ key: i.key, version: i.version, state: i.state, valueLength: i.value?.length })))

  if (items.length === 0) {
    return [
      {
        id: 'home',
        name: 'home',
        slug: '/home',
        status: 'draft',
        updatedAt: new Date().toISOString(),
        versions: [{ version: 1, updatedAt: new Date().toISOString(), status: 'draft', value: '' }],
      },
    ]
  }

  const grouped = new Map<string, typeof items>()
  for (const item of items) {
    if (!grouped.has(item.key)) grouped.set(item.key, [])
    grouped.get(item.key)!.push(item)
  }

  console.log('[CMS GET] grouped keys:', Array.from(grouped.keys()))
  for (const [key, versions] of grouped.entries()) {
    console.log(`[CMS GET] key="${key}" has ${versions.length} record(s):`,
      versions.map(v => ({ version: v.version, state: v.state, updatedOn: v.updatedOn }))
    )
  }

  return Array.from(grouped.entries()).map(([key, versions]) => {
    versions.sort((a, b) => {
      if (b.version !== a.version) return b.version - a.version
      // Same version: published beats draft
      if (a.state === 'published' && b.state !== 'published') return -1
      if (b.state === 'published' && a.state !== 'published') return 1
      return 0
    })
    const latest = versions[0]
    console.log(`[CMS GET] key="${key}" → picked latest: version=${latest.version} state=${latest.state} updatedOn=${latest.updatedOn}`)
    return {
      id: key,
      name: key,
      slug: `/${key}`,
      status: latest.state,
      updatedAt: latest.updatedOn,
      updatedBy: latest.updatedBy ?? '',
      versions: versions.map((v) => ({
        version: v.version,
        updatedAt: v.updatedOn,
        updatedBy: v.updatedBy ?? '',
        status: v.state,
        value: v.value,
      })),
    }
  })
})
