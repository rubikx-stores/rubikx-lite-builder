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
  const ODOO_URL = 'https://rubikx-stores-rubikx-2-0-prod.odoo.com/graphql'

  const token = getCookie(event, 'rb_auth_token')
  if (!token) {
    return []
  }

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
