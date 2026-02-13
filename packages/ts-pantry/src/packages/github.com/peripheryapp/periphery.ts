/**
 * **periphery** - A tool to identify unused code in Swift projects.
 *
 * @domain `github.com/peripheryapp/periphery`
 * @programs `periphery`
 * @version `3.4.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/peripheryapp/periphery`
 * @dependencies `curl.se`, `gnome.org/libxml2`
 * @buildDependencies `gnu.org/sed`, `crates.io/semverator` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomperipheryappperiphery
 * console.log(pkg.name)        // "periphery"
 * console.log(pkg.description) // "A tool to identify unused code in Swift projects."
 * console.log(pkg.programs)    // ["periphery"]
 * console.log(pkg.versions[0]) // "3.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/peripheryapp/periphery.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const peripheryPackage = {
  /**
   * The display name of this package.
   */
  name: 'periphery' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/peripheryapp/periphery' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to identify unused code in Swift projects.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peripheryapp/periphery/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/peripheryapp/periphery' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/peripheryapp/periphery' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/peripheryapp/periphery -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/peripheryapp/periphery' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'periphery',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se',
    'gnome.org/libxml2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/sed',
    'crates.io/semverator',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.4.0',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.21.2',
  ] as const,
  aliases: [] as const,
}

export type PeripheryPackage = typeof peripheryPackage
