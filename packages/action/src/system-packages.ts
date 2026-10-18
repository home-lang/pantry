import * as installer from '../../ts-pantry/src/installer'

export interface SystemPackageRequest {
  domain: string
  version: string
}

/** Resolve every native root before invoking its dependency solver once. */
export async function installResolvedSystemPackages(
  requests: SystemPackageRequest[],
  options: {
    installDir: string
    nativeInstall: (specs: string[]) => Promise<number>
    onRetry?: (message: string) => void
  },
): Promise<Map<string, string>> {
  const versions = new Map<string, string>()
  const native = new Map<string, string>()
  for (const { domain, version } of requests) {
    if (installer.isSupported(domain)) {
      const installed = await installer.installPackage(domain, version, {
        installDir: options.installDir, quiet: true, onRetry: options.onRetry,
      })
      versions.set(domain, installed.version)
      continue
    }
    const resolved = await installer.resolvePackageVersion(domain, version)
    const previous = native.get(domain)
    if (previous && previous !== resolved)
      throw new Error(`Conflicting required versions for ${domain}: ${previous} and ${resolved}`)
    native.set(domain, resolved)
  }
  const specs = [...native].map(([domain, version]) => `${domain}@${version}`)
  if (specs.length) {
    if (await options.nativeInstall(specs) !== 0) {
      const description = specs.length === 1 ? `package ${specs[0]}` : `package cohort ${specs.join(', ')}`
      throw new Error(`Pantry could not install required ${description}`)
    }
    for (const [domain, version] of native) versions.set(domain, version)
  }
  return versions
}

/** Bootstrap standalone runtimes with the SDK; resolve package graphs with Pantry. */
export async function installResolvedSystemPackage(
  domain: string,
  version: string,
  options: {
    installDir: string
    nativeInstall: (spec: string) => Promise<number>
    onRetry?: (message: string) => void
  },
): Promise<string> {
  const versions = await installResolvedSystemPackages([{ domain, version }], {
    ...options, nativeInstall: specs => options.nativeInstall(specs[0]!),
  })
  return versions.get(domain)!
}
