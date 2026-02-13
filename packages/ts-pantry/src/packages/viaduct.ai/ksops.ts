/**
 * **ksops** - KSOPS - A Flexible Kustomize Plugin for SOPS Encrypted Resources
 *
 * @domain `viaduct.ai/ksops`
 * @programs `ksops`
 * @version `4.4.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install viaduct.ai/ksops`
 * @buildDependencies `go.dev@~1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.viaductaiksops
 * console.log(pkg.name)        // "ksops"
 * console.log(pkg.description) // "KSOPS - A Flexible Kustomize Plugin for SOPS En..."
 * console.log(pkg.programs)    // ["ksops"]
 * console.log(pkg.versions[0]) // "4.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/viaduct-ai/ksops.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const viaductaiksopsPackage = {
  /**
   * The display name of this package.
   */
  name: 'ksops' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'viaduct.ai/ksops' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'KSOPS - A Flexible Kustomize Plugin for SOPS Encrypted Resources' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/viaduct.ai/ksops/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/viaduct-ai/kustomize-sops' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install viaduct.ai/ksops' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +viaduct.ai/ksops -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install viaduct.ai/ksops' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ksops',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.4.0',
    '4.3.3',
    '4.3.2',
  ] as const,
  aliases: [] as const,
}

export type ViaductaiksopsPackage = typeof viaductaiksopsPackage
