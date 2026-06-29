import { getCookie } from 'h3'

interface OdooCompany {
  id: number
  name: string
}

interface OdooCompanyResponse {
  data?: {
    company?: {
      ResCompany?: OdooCompany[]
    }
  }
}

export default defineEventHandler(async (event): Promise<OdooCompany[]> => {
  const config = useRuntimeConfig(event)
  if (!config.odooBaseUrl) {
    throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  }

  const token = getCookie(event, 'rb_auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const ODOO_URL = `${config.odooBaseUrl}/graphql`

  try {
    const res = await $fetch<OdooCompanyResponse>(ODOO_URL, {
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

    const companies: OdooCompany[] = res?.data?.company?.ResCompany ?? []
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
    }))
  } catch (e) {
    console.error('[WEBSITES] Failed to fetch companies from Odoo:', e)
    return []
  }
})
