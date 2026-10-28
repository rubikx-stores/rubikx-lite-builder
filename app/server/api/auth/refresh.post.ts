import { getCookie, setCookie } from 'h3'

// Same mutation the headless site uses (server/mutations/extendSession.ts):
// it calls ResUsers.update_jwt_token with the still-valid token as Bearer auth.
const EXTEND_SESSION_MUTATION = `mutation Method {
  extendSession: ResUsers(
    method_name: "update_jwt_token",
    method_parameters: {}
  ) {
    id
  }
}`

// Longest a session can be kept alive by extending, counted from login.
const MAX_SESSION_MS = 8 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (!config.odooBaseUrl) {
    throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  }

  const token = getCookie(event, 'rb_auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'Not authenticated' })

  // Sessions that started before this cookie existed have no start time and are not capped.
  const startedAt = Number(getCookie(event, 'rb_session_start'))
  if (startedAt && Date.now() - startedAt > MAX_SESSION_MS) {
    throw createError({ statusCode: 401, message: 'Session limit reached, please sign in again' })
  }

  const companyId = config.odooCompanyId ? Number(config.odooCompanyId) : undefined
  const variables = companyId ? { context: { allowed_company_ids: [companyId] } } : {}

  const res: any = await $fetch(`${config.odooBaseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: { query: EXTEND_SESSION_MUTATION, variables },
  }).catch((e: any) => {
    console.error('[session] refresh failed', e?.statusCode, e?.data ?? e?.message)
    return null
  })

  // The headless site reads the new JWT from data.result; accept the alias too.
  const newToken = res?.data?.result ?? res?.data?.extendSession
  if (typeof newToken !== 'string' || !newToken) {
    throw createError({ statusCode: 401, message: 'Could not extend session' })
  }

  let expiresIn: number
  try {
    expiresIn = Math.floor(decodeJwt(newToken).exp - Date.now() / 1000)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid token from backend' })
  }
  if (!(expiresIn > 0)) {
    throw createError({ statusCode: 401, message: 'Token already expired' })
  }

  setCookie(event, 'rb_auth_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: expiresIn,
  })

  return { success: true, expiresIn }
})
