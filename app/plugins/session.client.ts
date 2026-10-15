// Counts down to JWT expiry and syncs extend/logout across tabs.
// The modal itself lives in components/SessionExpiryModal.client.vue.
export default defineNuxtPlugin(() => {
  const session = useSession()
  const { user } = useAuth()

  // `user` (and `session_expires_in`) are filled server-side by auth.global.ts,
  // so they're set on any authenticated page load. Not logged in (e.g. /login)
  // → nothing to track. Falls back to asking the server if the value is missing.
  const initialExpiresIn = useState<number | null>('session_expires_in', () => null)
  if (user.value) {
    if (initialExpiresIn.value) {
      session.setExpiresIn(initialExpiresIn.value)
      initialExpiresIn.value = null
    } else {
      session.sync().catch(() => {})
    }
  }

  function tick() {
    if (session.deadline.value === null || session.refreshing.value) return
    session.remaining.value = Math.max(Math.floor((session.deadline.value - Date.now()) / 1000), 0)
  }

  // One 1s tick computed from the deadline (not a decrementing counter), so a
  // throttled background tab or a slept laptop catches up on the next tick.
  const timer = setInterval(tick, 1000)
  const onVisible = () => { if (document.visibilityState === 'visible') tick() }
  document.addEventListener('visibilitychange', onVisible)

  // Dev hot-reload re-runs this plugin; clean up so timers/listeners don't stack.
  import.meta.hot?.dispose(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  })

  const channel = session.getChannel()
  if (channel) {
    let extendingGuard: ReturnType<typeof setTimeout> | undefined
    channel.onmessage = ({ data }) => {
      if (data?.type === 'EXTENDING') {
        // Another tab is extending: disable our button. The guard stops us
        // staying stuck if that tab closes mid-request.
        session.refreshing.value = true
        clearTimeout(extendingGuard)
        extendingGuard = setTimeout(() => { session.refreshing.value = false }, 15000)
      } else if (data?.type === 'EXTEND_FAILED') {
        clearTimeout(extendingGuard)
        session.refreshing.value = false
      } else if (data?.type === 'EXTENDED') {
        clearTimeout(extendingGuard)
        session.refreshing.value = false
        session.setExpiresIn(data.expiresIn, { dismiss: true })
      } else if (data?.type === 'LOGOUT') {
        user.value = null
        session.clear()
        navigateTo('/login')
      }
    }
  }
})
