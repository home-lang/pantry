/**
 * **pakku** - pakku is a declarative approach to your system package managers.
 *
 * @domain `github.com/mycreepy/pakku`
 * @programs `pakku`
 * @version `0.6.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mycreepy/pakku`
 * @buildDependencies `go.dev@^1.23`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommycreepypakku
 * console.log(pkg.name)        // "pakku"
 * console.log(pkg.description) // "pakku is a declarative approach to your system ..."
 * console.log(pkg.programs)    // ["pakku"]
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mycreepy/pakku.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pakkuPackage = {
  /**
   * The display name of this package.
   */
  name: 'pakku' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mycreepy/pakku' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'pakku is a declarative approach to your system package managers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mycreepy/pakku/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mycreepy/pakku' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mycreepy/pakku' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mycreepy/pakku -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mycreepy/pakku' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pakku',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.23',
    'goreleaser.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type PakkuPackage = typeof pakkuPackage
