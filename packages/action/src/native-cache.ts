import { createHash } from 'node:crypto'
import { resolveTransitiveDependencies } from '../../ts-pantry/src/dependency-resolver'
import { compareInstallerVersionsDesc, isSupported, registryMetadata, resolveInstallerConstraintFromCandidates } from '../../ts-pantry/src/installer'
import type { RegistryMetadata } from '../../ts-pantry/src/installer'
import { resolvePackageDomain } from '../../ts-pantry/src/utils'
import type { Platform } from './types'

/** Registry artifacts can be rebuilt without changing their package version. */
export async function nativeArtifactCacheIdentity(
  specs: string[],
  platform: Platform,
  readMetadata: (domain: string) => Promise<RegistryMetadata> = async (domain) => {
    const metadata = await registryMetadata(domain, { maxAttempts: 3, retryDelayMs: 500 })
    if (!metadata) throw new Error(`${domain}: registry returned 404`)
    return metadata
  },
  dependencies: (domain: string) => Promise<string[]> = async domain =>
    (await resolveTransitiveDependencies(domain, { targetOs: platform.os, targetArch: platform.arch })).map(dep => `${dep.name}@${dep.constraint.replace(/^@/, '')}`),
  lockedVersions: Map<string, string> = new Map(),
): Promise<string> {
  const domains = new Map<string, Set<string>>()
  const add = (spec: string) => {
    const [name, constraint = 'latest'] = spec.split('@', 2)
    const domain = resolvePackageDomain(name)
    if (isSupported(domain)) return domain
    if (!domains.has(domain)) domains.set(domain, new Set())
    domains.get(domain)!.add(constraint || 'latest')
    const locked = lockedVersions.get(domain)
    if (locked) domains.get(domain)!.add(locked)
    return domain
  }
  for (const spec of specs) {
    const domain = add(spec)
    if (isSupported(domain)) continue // SDK runtimes use their upstream versioned archives.
    for (const dependency of await dependencies(domain)) add(dependency)
  }
  const platformKey = `${platform.os}-${platform.arch === 'arm64' ? 'arm64' : 'x86-64'}`
  const artifacts = await Promise.all([...domains.keys()].sort().map(async (domain) => {
    const metadata = await readMetadata(domain)
    const candidates = Object.keys(metadata.versions || {}).filter(version => metadata.versions![version].platforms?.[platformKey])
    // Use the same constraint evaluator as the installer. A historical version
    // with no digest must not disable caching of a verified current selection.
    // Include each range's candidate and lock pin so shared dependency choices
    // are represented even when two roots declare different constraints.
    const selected = new Set([...domains.get(domain)!].map(constraint =>
      ['latest', '*', ''].includes(constraint)
        ? [...candidates].sort(compareInstallerVersionsDesc)[0]
        : candidates.includes(constraint.replace(/^v/, '')) ? constraint.replace(/^v/, '')
        : /^\d+(?:\.\d+)?$/.test(constraint)
          ? candidates.filter(version => version.startsWith(`${constraint}.`)).sort(compareInstallerVersionsDesc)[0]
          : resolveInstallerConstraintFromCandidates(constraint, candidates),
    ))
    const versions = [...selected].sort().map((version) => {
      if (!version) throw new Error(`${domain}: no matching ${platformKey} artifact`)
      const artifact = metadata.versions![version].platforms![platformKey]
      if (!artifact.sha256?.match(/^[a-f0-9]{64}$/i)) throw new Error(`${domain}@${version}: missing artifact digest`)
      return [version, artifact.tarball, artifact.sha256.toLowerCase()]
    })
    if (!versions.length) throw new Error(`${domain}: no verified ${platformKey} artifacts`)
    return [domain, versions]
  }))
  return createHash('sha256').update(JSON.stringify(artifacts)).digest('hex')
}
