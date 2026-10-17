import { createHash } from 'node:crypto'
import { resolveTransitiveDependencies } from '../../ts-pantry/src/dependency-resolver'
import { isSupported } from '../../ts-pantry/src/installer'
import type { RegistryMetadata } from '../../ts-pantry/src/installer'
import { resolvePackageDomain } from '../../ts-pantry/src/utils'
import type { Platform } from './types'

/** Registry artifacts can be rebuilt without changing their package version. */
export async function nativeArtifactCacheIdentity(
  specs: string[],
  platform: Platform,
  readMetadata: (domain: string) => Promise<RegistryMetadata> = async (domain) => {
    const response = await fetch(`https://registry.pantry.dev/binaries/${encodeURI(domain)}/metadata.json`, { signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`${domain}: registry returned ${response.status}`)
    return response.json() as Promise<RegistryMetadata>
  },
  dependencies: (domain: string) => Promise<string[]> = async domain =>
    (await resolveTransitiveDependencies(domain, { targetOs: platform.os })).map(dep => dep.name),
): Promise<string> {
  const domains = new Set<string>()
  for (const spec of specs) {
    const domain = resolvePackageDomain(spec.split('@')[0])
    if (isSupported(domain)) continue // SDK runtimes use their upstream versioned archives.
    domains.add(domain)
    for (const dependency of await dependencies(domain)) {
      if (!isSupported(dependency)) domains.add(dependency)
    }
  }
  const platformKey = `${platform.os}-${platform.arch === 'arm64' ? 'arm64' : 'x86-64'}`
  const artifacts = await Promise.all([...domains].sort().map(async (domain) => {
    const metadata = await readMetadata(domain)
    // Include every available version for this platform: the native resolver
    // applies lock pins/ranges, and a republish of any candidate must not reuse
    // the previous artifact. Other platforms do not invalidate this runner.
    const versions = Object.entries(metadata.versions || {}).sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([version, info]) => {
        const artifact = info.platforms?.[platformKey]
        if (!artifact) return []
        if (!artifact.sha256?.match(/^[a-f0-9]{64}$/i)) throw new Error(`${domain}@${version}: missing artifact digest`)
        return [[version, artifact.tarball, artifact.sha256.toLowerCase()]]
      })
    if (!versions.length) throw new Error(`${domain}: no verified ${platformKey} artifacts`)
    return [domain, versions]
  }))
  return createHash('sha256').update(JSON.stringify(artifacts)).digest('hex')
}
