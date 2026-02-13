/**
 * **melt** - Author, manage, and run multitrack audio/video compositions
 *
 * @domain `charm.sh/melt`
 * @programs `melt`
 * @version `0.6.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/melt`
 * @homepage https://www.mltframework.org/
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshmelt
 * console.log(pkg.name)        // "melt"
 * console.log(pkg.description) // "Author, manage, and run multitrack audio/video ..."
 * console.log(pkg.programs)    // ["melt"]
 * console.log(pkg.versions[0]) // "0.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/melt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshmeltPackage = {
  /**
   * The display name of this package.
   */
  name: 'melt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'charm.sh/melt' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Author, manage, and run multitrack audio/video compositions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/melt/package.yml' as const,
  homepageUrl: 'https://www.mltframework.org/' as const,
  githubUrl: 'https://github.com/mltframework/mlt' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install charm.sh/melt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/melt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/melt' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'melt',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type CharmshmeltPackage = typeof charmshmeltPackage
