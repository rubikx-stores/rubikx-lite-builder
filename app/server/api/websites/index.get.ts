export default defineEventHandler(async (event) => {
  const ODOO_URL = 'https://rubikx-stores-rubikx-2-0-prod.odoo.com/graphql'

  const token = getCookie(event, 'rb_auth_token')
  if (!token) {
    return []
  }

  try {
    const res = await $fetch<any>(ODOO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        query: `query company { ResCompany { id name } }`,
        variables: {}
      }
    })

    const companies = res?.data?.company?.ResCompany ?? []
    return companies.map((c: any) => ({
      id: c.id,
      name: c.name,
    }))
  } catch (e) {
    console.error('[WEBSITES] Failed to fetch companies from Odoo:', e)
    return []
  }
})
