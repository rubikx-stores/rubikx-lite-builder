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

  const { companyId: companyIdParam } = getQuery(event) as { companyId?: string }
  const companyId = companyIdParam ? Number(companyIdParam) : undefined

  const fetchRes = await $fetch<any>(ODOO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: {
      query: `query MyQuery($context: Any) { RubikxCms(context: $context) { id key state } }`,
      variables: { context: companyId ? { allowed_company_ids: [companyId] } : {} }
    }
  })

  const allRecords = fetchRes?.data?.MyQuery?.RubikxCms ?? []
  const pageRecords = allRecords.filter((r: any) => r.key === key)

  if (pageRecords.length === 0) {
    throw createError({ statusCode: 404, message: `No records found for key: ${key}` })
  }

  const hasPublished = pageRecords.some((r: any) => r.state === 'published')
  if (hasPublished) {
    throw createError({ statusCode: 403, message: `Cannot delete a published page. Unpublish it first.` })
  }

  const idsToDelete = pageRecords.map((r: any) => r.id)

  await Promise.all(
    idsToDelete.map((id: number) =>
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

  return { deleted: idsToDelete.length, ids: idsToDelete }
})
