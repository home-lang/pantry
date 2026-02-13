/**
 * **tools** - pkgx package
 *
 * @domain `golang.org/tools`
 * @version `0.41.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install golang.org/tools`
 * @buildDependencies `go.dev@~1.25` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.golangorgtools
 * console.log(pkg.name)        // "tools"
 * console.log(pkg.versions[0]) // "0.41.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/golang-org/tools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const golangorgtoolsPackage = {
  /**
   * The display name of this package.
   */
  name: 'tools' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'golang.org/tools' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/golang.org/tools/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install golang.org/tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +golang.org/tools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install golang.org/tools' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.25',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.41.0',
    '0.40.0',
    '0.39.0',
  ] as const,
  aliases: [] as const,
}

export type GolangorgtoolsPackage = typeof golangorgtoolsPackage
