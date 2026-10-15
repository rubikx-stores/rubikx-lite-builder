import { deleteCookie } from 'h3'

export default defineEventHandler(async (event) => {
  deleteCookie(event, 'rb_auth_token', {
    httpOnly: true,
    // Must match login.post.ts, otherwise the cookie isn't cleared on http://localhost.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  deleteCookie(event, 'rb_session_start', { path: '/' })

  return { success: true }
})
