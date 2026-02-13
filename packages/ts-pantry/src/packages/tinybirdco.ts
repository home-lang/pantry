/**
 * **tb** - pkgx package
 *
 * @domain `tinybird.co`
 * @programs `tb`
 * @version `5.22.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tinybird.co`
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.13` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tinybirdco
 * console.log(pkg.name)        // "tb"
 * console.log(pkg.programs)    // ["tb"]
 * console.log(pkg.versions[0]) // "5.22.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tinybird-co.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tinybirdcoPackage = {
  /**
   * The display name of this package.
   */
  name: 'tb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tinybird.co' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tinybird.co/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tinybird.co' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tinybird.co -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tinybird.co' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tb',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.22.2',
    '5.22.0',
    '5.21.1',
    '5.21.0',
    '5.20.0',
  ] as const,
  aliases: [] as const,
}

export type TinybirdcoPackage = typeof tinybirdcoPackage
