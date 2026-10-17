/** Order complete dependency components before their consumers. Cyclic source
 * packages share their already-published bootstrap dependencies within a component. */
export function publicationOrder<T extends { domain: string, depDomains: string[] }>(packages: T[]): T[] {
  const byDomain = new Map(packages.map(pkg => [pkg.domain, pkg]))
  if (byDomain.size !== packages.length) throw new Error('Duplicate publication package domain')
  const indices = new Map<string, number>()
  const low = new Map<string, number>()
  const stack: string[] = []
  const active = new Set<string>()
  const ordered: T[] = []
  let index = 0
  const visit = (domain: string): void => {
    indices.set(domain, index)
    low.set(domain, index++)
    stack.push(domain)
    active.add(domain)
    for (const dependency of [...new Set(byDomain.get(domain)!.depDomains)].sort()) {
      if (!byDomain.has(dependency)) continue
      if (!indices.has(dependency)) {
        visit(dependency)
        low.set(domain, Math.min(low.get(domain)!, low.get(dependency)!))
      }
      else if (active.has(dependency)) low.set(domain, Math.min(low.get(domain)!, indices.get(dependency)!))
    }
    if (low.get(domain) !== indices.get(domain)) return
    const component: string[] = []
    let member: string
    do {
      member = stack.pop()!
      active.delete(member)
      component.push(member)
    } while (member !== domain)
    ordered.push(...component.sort().map(name => byDomain.get(name)!))
  }
  for (const domain of [...byDomain.keys()].sort()) if (!indices.has(domain)) visit(domain)
  return ordered
}
