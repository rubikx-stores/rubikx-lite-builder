import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rb_auth_token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  try {
    const payload = decodeJwt(token)
    const expiresIn = Math.floor(payload.exp - Date.now() / 1000)

    if (expiresIn <= 0) {
      throw createError({ statusCode: 401, message: 'Token expired' })
    }

    return {
      user: {
        name: payload.name || payload.email?.split('@')[0] || 'User',
        email: payload.email || payload.sub || '',
      },
      // Seconds left. The cookie is httpOnly so the browser can't read `exp`
      // itself, and sending a duration (not a timestamp) avoids clock skew.
      expiresIn,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
})
