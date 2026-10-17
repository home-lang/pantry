export interface DependencyPlatform {
  os: 'linux' | 'darwin' | 'windows'
  arch?: string
}

export function normalizeDependencyArch(arch: string): string {
  if (arch === 'x86-64' || arch === 'x86_64') return 'x64'
  if (arch === 'aarch64') return 'arm64'
  return arch
}

/** A platform selector is a group, never a package domain. */
export function dependencyPlatform(selector: string): DependencyPlatform | undefined {
  const match = /^(linux|darwin|windows)(?:\/([a-z0-9_-]+))?$/.exec(selector)
  if (!match) return undefined
  return { os: match[1] as DependencyPlatform['os'], ...(match[2] ? { arch: normalizeDependencyArch(match[2]) } : {}) }
}

/** Preserve recipe guards while serializing dependency maps for both catalogs. */
export function recipeDepsToSpecs(deps: unknown): string[] {
  if (!deps || typeof deps !== 'object' || Array.isArray(deps)) return []
  const spec = (name: string, value: unknown): string => {
    if (value !== null && typeof value !== 'string' && !(typeof value === 'number' && Number.isFinite(value)))
      throw new TypeError(`Invalid constraint for dependency ${name}`)
    const constraint = value === null ? '' : String(value).trim()
    const suffix = !constraint || constraint === '*' ? '' : /^[\^~><=@]/.test(constraint) ? constraint : `@${constraint}`
    return `${name}${suffix}`
  }
  const out: string[] = []
  for (const [name, value] of Object.entries(deps)) {
    if (dependencyPlatform(name)) {
      if (value === null) continue
      if (typeof value !== 'object' || Array.isArray(value))
        throw new TypeError(`Dependency platform ${name} must contain a dependency map`)
      for (const [dependency, constraint] of Object.entries(value)) out.push(`${name}:${spec(dependency, constraint)}`)
      continue
    }
    out.push(spec(name, value))
  }
  return out
}
