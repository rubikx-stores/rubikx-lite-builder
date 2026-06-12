export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) throw createError({ statusCode: 400, message: 'key is required' })

  const PROTECTED_KEYS = ['global-header', 'global-footer']
  if (PROTECTED_KEYS.includes(key)) {
    throw createError({ statusCode: 403, message: `Cannot delete protected key: ${key}` })
  }

  const ODOO_URL = 'https://rubikx-stores-rubikx-2-0-prod.odoo.com/graphql'
  const API_KEY = 'ec66a59946ecae022949f32f5c65cc67'

  const fetchRes = await $fetch<any>(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: {
      query: `query MyQuery { RubikxCms { id key state } }`,
      variables: { context: { allowed_company_ids: [3] } }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: {
          query: `mutation Delete { deleteRubikxCms: RubikxCms(id: ${id}) }`,
          variables: { context: { allowed_company_ids: [3] } }
        }
      })
    )
  )

  return { deleted: idsToDelete.length, ids: idsToDelete }
})
