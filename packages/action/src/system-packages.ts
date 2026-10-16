import * as installer from '../../ts-pantry/src/installer'

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
  if (installer.isSupported(domain)) {
    return (await installer.installPackage(domain, version, {
      installDir: options.installDir, quiet: true, onRetry: options.onRetry,
    })).version
  }
  const resolved = await installer.resolvePackageVersion(domain, version)
  const spec = `${domain}@${resolved}`
  if (await options.nativeInstall(spec) !== 0) throw new Error(`Pantry could not install required package ${spec}`)
  return resolved
}
