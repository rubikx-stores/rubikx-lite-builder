import type { Release } from '~/types/release'

const STORAGE_KEY = 'rubikx-seen-releases'

export function formatReleaseDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function useReleaseNotes() {
  const { data } = useFetch<Release[]>('/api/releases', { key: 'releases', default: () => [] })
  const releases = computed(() => data.value ?? [])

  // Shared between the header badge, the drawer and the dashboard card.
  // seenIds stays null until the browser has read localStorage, so the unread
  // dot never flashes on first paint.
  const seenIds = useState<string[] | null>('release-seen-ids', () => null)
  const drawerOpen = useState('release-drawer-open', () => false)

  onMounted(() => {
    if (seenIds.value !== null) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      seenIds.value = Array.isArray(parsed) ? parsed : []
    } catch {
      seenIds.value = []
    }
  })

  const unreadCount = computed(() => {
    const seen = seenIds.value
    if (seen === null) return 0
    return releases.value.filter((r) => !seen.includes(r.id)).length
  })

  function markAllSeen() {
    if (!releases.value.length) return
    const ids = [...new Set([...(seenIds.value ?? []), ...releases.value.map((r) => r.id)])]
    seenIds.value = ids
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // storage unavailable: unread state lasts for this session only
    }
  }

  function openDrawer() {
    drawerOpen.value = true
    markAllSeen()
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  return { releases, unreadCount, drawerOpen, openDrawer, closeDrawer, markAllSeen }
}
