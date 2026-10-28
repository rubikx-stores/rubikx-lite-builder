
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (!config.odooBaseUrl) {
    throw createError({ statusCode: 500, message: 'ODOO_BASE_URL is not configured' })
  }
  const _error = 'An unexpected error occurred during login!'
  try {
    const body = await readBody(event)
    if (!body?.email || !body?.password) {
      throw createError({ statusCode: 400, message: 'Email and password are required' })
    }
    const url = `${config.odooBaseUrl}/graphql/api/jwt/auth/login`
    let result: any
    try {
      result = await $fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: { login: body.email, password: body.password },
      })
    } catch (odooError: any) {
      throw createError({ statusCode: 401, message: odooError?.data?.message || 'Invalid credentials' })
    }
    if (!result?.token) {
      throw createError({ statusCode: 400, message: result?.result?.error || _error })
    }
    const payload = decodeJwt(result.token)
    const expiresAtMs = payload.exp * 1000
    const maxAgeSeconds = Math.floor((expiresAtMs - Date.now()) / 1000)
    if (maxAgeSeconds <= 0) {
      throw createError({ statusCode: 401, statusMessage: 'Token already expired' })
    }
    setCookie(event, 'rb_auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds,
    })
    // When this login started. /api/auth/refresh uses it to cap total session length.
    setCookie(event, 'rb_session_start', String(Date.now()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return {
      statusCode: 200,
      success: true,
      maxAge: Date.now() + maxAgeSeconds * 1000,
      message: result?.msg || 'Login successful',
    }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, message: error.message || _error })
  }
})
