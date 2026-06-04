export interface FlatCategory {
  id: number
  name: string
  displayName: string
  headlessName: string
  parentId?: number | null
}

export interface CategoryNode {
  id: number
  name: string
  displayName: string
  headlessName: string
  children: CategoryNode[]
}

export function buildCategoryTree(flat: FlatCategory[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>()
  for (const c of flat) {
    map.set(c.id, { id: c.id, name: c.name, displayName: c.displayName, headlessName: c.headlessName, children: [] })
  }
  const roots: CategoryNode[] = []
  for (const c of flat) {
    const node = map.get(c.id)!
    if (c.parentId != null && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}
