// GET /api/releases
// Release notes shown on the dashboard, newest first. Source: server/data/releases.json
import releases from '../data/releases.json'

export default defineEventHandler((event) => {
  // Content only changes on deploy, so let browsers/CDN reuse it briefly
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return [...releases].sort((a, b) => b.date.localeCompare(a.date))
})
