import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rb_auth_token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'))

    if (payload.exp * 1000 < Date.now()) {
      throw createError({ statusCode: 401, message: 'Token expired' })
    }

    return {
      user: {
        name: payload.name || payload.email?.split('@')[0] || 'User',
        email: payload.email || payload.sub || '',
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
})
