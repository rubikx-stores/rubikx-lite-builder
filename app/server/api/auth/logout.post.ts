import { deleteCookie } from 'h3'

export default defineEventHandler(async (event) => {
  deleteCookie(event, 'rb_auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  })

  return { success: true }
})
