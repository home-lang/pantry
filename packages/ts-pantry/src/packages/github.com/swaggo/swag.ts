/**
 * **swag** - pkgx package
 *
 * @domain `github.com/swaggo/swag`
 * @version `1.16.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/swaggo/swag`
 * @buildDependencies `go.dev@~1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomswaggoswag
 * console.log(pkg.name)        // "swag"
 * console.log(pkg.versions[0]) // "1.16.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/swaggo/swag.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swagPackage = {
  /**
   * The display name of this package.
   */
  name: 'swag' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/swaggo/swag' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/swaggo/swag/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/swaggo/swag' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/swaggo/swag -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/swaggo/swag' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.16.6',
  ] as const,
  aliases: [] as const,
}

export type SwagPackage = typeof swagPackage
