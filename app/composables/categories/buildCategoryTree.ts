export interface FlatCategory {
  id: number
  name: string
  displayName: string
  headlessName: string | false
  parentId?: number | null
}

export interface CategoryNode {
  id?: number
  name: string
  displayName: string
  headlessName: string | false
  children: CategoryNode[]
}

// Hierarchy is encoded in displayName, not parentId, to any depth: a leaf's
// displayName is the full path joined by " / " (e.g.
// "Apparel / Men's / T-shirt"), while a top-level category's displayName has
// no " / " in it. This mirrors the live storefront's groupCategories
// (app/layouts/default.vue) exactly, so the builder preview and the
// published site always produce the same tree from the same flat API
// response, at any nesting depth.
//
// Any ancestor label that never appears as its own row (e.g. Odoo never
// returns a plain "Apparel" category, only "Apparel / Men's") gets a
// synthesized placeholder node instead of being dropped or promoted to a
// flat item — same reasoning as groupCategories: it preserves the hierarchy
// the merchant actually configured even when an ancestor record itself
// isn't public/returned.
//
// Real rows are pre-registered by their full path before any parent/child
// link is made, so a real ancestor is always found and reused regardless of
// where it falls in the input order relative to its descendants — avoiding
// both a duplicate node for the same category and losing its real id to a
// synthesized stand-in.
export function buildCategoryTree(flat: FlatCategory[]): CategoryNode[] {
  // Both this pre-registration pass and the path-building pass below must
  // key on the exact same normalized string, or a real row's displayName
  // having irregular spacing around " / " (e.g. "Apparel/Men's" or
  // "Apparel  /  Men's") makes the two passes compute different keys for
  // the same category — which reads as "no real row exists" and spawns a
  // duplicate synthesized placeholder instead of reusing the real one,
  // silently losing its id to a synthesized stand-in.
  const normalizePath = (label: string) => label.split(' / ').map((s) => s.trim()).join(' / ')

  const pathMap = new Map<string, CategoryNode>()
  for (const c of flat) {
    const label = (c.displayName ?? c.name ?? '').trim()
    if (label) pathMap.set(normalizePath(label), { id: c.id, name: c.name, displayName: c.displayName, headlessName: c.headlessName, children: [] })
  }

  const getOrCreate = (segments: string[]): CategoryNode => {
    const path = segments.join(' / ')
    let node = pathMap.get(path)
    if (!node) {
      // Placeholder's own displayName is just its leaf label, not the full
      // path — every consumer reads headlessName||displayName||name as a
      // single-segment label/filter value, at any depth.
      const leaf = segments[segments.length - 1]
      node = { name: leaf, displayName: leaf, headlessName: false, children: [] }
      pathMap.set(path, node)
    }
    return node
  }

  const roots: CategoryNode[] = []
  const rootPlaced = new Set<string>()
  const linked = new Set<string>()

  for (const c of flat) {
    const label = (c.displayName ?? c.name ?? '').trim()
    if (!label) continue
    const segments = label.split(' / ').map((s) => s.trim())

    for (let i = 1; i <= segments.length; i++) {
      const currentPath = segments.slice(0, i).join(' / ')
      const node = getOrCreate(segments.slice(0, i))
      if (i === 1) {
        if (!rootPlaced.has(currentPath)) {
          roots.push(node)
          rootPlaced.add(currentPath)
        }
      } else {
        const parentPath = segments.slice(0, i - 1).join(' / ')
        const linkKey = `${parentPath} >> ${currentPath}`
        if (!linked.has(linkKey)) {
          getOrCreate(segments.slice(0, i - 1)).children.push(node)
          linked.add(linkKey)
        }
      }
    }
  }

  return roots
}
