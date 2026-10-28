// Session-expiry state shared by the plugin (timer) and SessionExpiryModal.
// The deadline is kept as a local timestamp built from the server's
// "seconds left", so a wrong client clock can't skew the countdown.

const SESSION_WARN_SECONDS = 5 * 60

type AuthMessage =
  | { type: 'EXTENDED'; expiresIn: number }
  | { type: 'EXTENDING' }
  | { type: 'EXTEND_FAILED' }
  | { type: 'LOGOUT' }

let channel: BroadcastChannel | null = null
function getAuthChannel(): BroadcastChannel | null {
  if (!import.meta.client || typeof BroadcastChannel === 'undefined') return null
  return (channel ??= new BroadcastChannel('rb-auth'))
}

export const useSession = () => {
  const deadline = useState<number | null>('session_deadline', () => null)
  const remaining = useState<number>('session_remaining', () => Infinity)
  const refreshing = useState<boolean>('session_refreshing', () => false)
  // Deadline the user already dismissed (X) or extended away, so the warning stays closed for it.
  const dismissedDeadline = useState<number | null>('session_dismissed_deadline', () => null)
  const extendError = useState<string>('session_extend_error', () => '')

  const expired = computed(() => deadline.value !== null && remaining.value <= 0)
  const visible = computed(() => {
    if (deadline.value === null || remaining.value > SESSION_WARN_SECONDS) return false
    // Expired always shows (re-login is required); the warning can be dismissed.
    return remaining.value <= 0 || dismissedDeadline.value !== deadline.value
  })

  // `dismiss: true` keeps the warning closed for this new deadline (used after extending).
  function setExpiresIn(seconds: number, opts: { dismiss?: boolean } = {}) {
    deadline.value = Date.now() + seconds * 1000
    remaining.value = seconds
    extendError.value = ''
    dismissedDeadline.value = opts.dismiss ? deadline.value : null
  }

  function dismiss() {
    dismissedDeadline.value = deadline.value
  }

  function clear() {
    deadline.value = null
    remaining.value = Infinity
    extendError.value = ''
    dismissedDeadline.value = null
  }

  function broadcast(msg: AuthMessage) {
    getAuthChannel()?.postMessage(msg)
  }

  // Re-read the remaining time from the server (after login / page load).
  async function sync() {
    const data = await $fetch<{ expiresIn: number }>('/api/auth/me')
    setExpiresIn(data.expiresIn)
  }

  async function extend() {
    if (refreshing.value) return
    refreshing.value = true
    extendError.value = ''
    broadcast({ type: 'EXTENDING' }) // other tabs disable their button meanwhile
    try {
      const { expiresIn } = await $fetch<{ expiresIn: number }>('/api/auth/refresh', { method: 'POST' })
      setExpiresIn(expiresIn, { dismiss: true })
      broadcast({ type: 'EXTENDED', expiresIn })
    } catch {
      extendError.value = 'Could not extend your session. Try again or log out.'
      broadcast({ type: 'EXTEND_FAILED' })
    } finally {
      refreshing.value = false
    }
  }

  return { deadline, remaining, refreshing, extendError, expired, visible, setExpiresIn, dismiss, clear, broadcast, sync, extend, getChannel: getAuthChannel }
}
