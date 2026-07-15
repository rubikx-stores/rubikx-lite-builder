// Generic in-memory LRU cache. Module-scoped instances persist for the
// lifetime of the server process (or Lambda container) and are shared across
// requests handled by that instance.
export class LRUCache<K, V> {
  private map = new Map<K, V>()

  constructor(private readonly maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.map.get(key)
    if (value === undefined) return undefined
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    this.map.delete(key)
    if (this.map.size >= this.maxSize) {
      const oldestKey = this.map.keys().next().value
      if (oldestKey !== undefined) this.map.delete(oldestKey)
    }
    this.map.set(key, value)
  }
}

export const uploadUrlCache = new LRUCache<string, string>(500)
