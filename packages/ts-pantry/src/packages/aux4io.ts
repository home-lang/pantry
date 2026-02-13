/**
 * **aux4** - elevate your imagination
 *
 * @domain `aux4.io`
 * @programs `aux4`
 * @version `5.1.11` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aux4.io`
 * @homepage https://aux4.io
 * @buildDependencies `go.dev@~1.21.5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.aux4io
 * console.log(pkg.name)        // "aux4"
 * console.log(pkg.description) // "elevate your imagination"
 * console.log(pkg.programs)    // ["aux4"]
 * console.log(pkg.versions[0]) // "5.1.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aux4-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aux4ioPackage = {
  /**
   * The display name of this package.
   */
  name: 'aux4' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'aux4.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'elevate your imagination' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aux4.io/package.yml' as const,
  homepageUrl: 'https://aux4.io' as const,
  githubUrl: 'https://github.com/aux4/aux4' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install aux4.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aux4.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aux4.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'aux4',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.21.5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.11',
    '5.1.10',
    '5.1.9',
    '5.1.8',
    '5.1.7',
    '5.1.6',
    '5.1.5',
    '5.1.4',
    '5.1.3',
    '5.1.2',
    '5.1.0',
    '5.0.14',
    '5.0.11',
    '5.0.10',
    '5.0.9',
    '5.0.8',
    '5.0.3',
  ] as const,
  aliases: [] as const,
}

export type Aux4ioPackage = typeof aux4ioPackage
