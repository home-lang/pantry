/**
 * **gomplate** - A flexible commandline tool for template rendering. Supports lots of local and remote datasources.
 *
 * @domain `gomplate.ca`
 * @programs `gomplate`
 * @version `5.0.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gomplate.ca`
 * @homepage https://gomplate.ca/
 * @buildDependencies `go.dev@~1.22.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gomplateca
 * console.log(pkg.name)        // "gomplate"
 * console.log(pkg.description) // "A flexible commandline tool for template render..."
 * console.log(pkg.programs)    // ["gomplate"]
 * console.log(pkg.versions[0]) // "5.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gomplate-ca.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gomplatecaPackage = {
  /**
   * The display name of this package.
   */
  name: 'gomplate' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gomplate.ca' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A flexible commandline tool for template rendering. Supports lots of local and remote datasources.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gomplate.ca/package.yml' as const,
  homepageUrl: 'https://gomplate.ca/' as const,
  githubUrl: 'https://github.com/hairyhenderson/gomplate' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gomplate.ca' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gomplate.ca -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gomplate.ca' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gomplate',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22.3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.0.0',
    '4.3.3',
    '4.3.2',
    '4.3.1',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.1',
    '4.0.0',
    '3.11.8',
    '3.11.7',
    '3.11.6',
    '3.11.4',
  ] as const,
  aliases: [] as const,
}

export type GomplatecaPackage = typeof gomplatecaPackage
