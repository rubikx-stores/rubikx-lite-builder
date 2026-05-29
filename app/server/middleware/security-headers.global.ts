import { defineEventHandler, setResponseHeader, type H3Event } from 'h3'
export default defineEventHandler((event: H3Event) => {
  setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setResponseHeader(event, 'Content-Security-Policy', "frame-ancestors 'self'")
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-DNS-Prefetch-Control', 'off')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})
