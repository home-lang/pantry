/**
 * **diun** - Receive notifications when an image is updated on a Docker registry
 *
 * @domain `crazymax.dev/diun`
 * @programs `diun`
 * @version `4.31.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crazymax.dev/diun`
 * @homepage https://crazymax.dev/diun/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.crazymaxdevdiun
 * console.log(pkg.name)        // "diun"
 * console.log(pkg.description) // "Receive notifications when an image is updated ..."
 * console.log(pkg.programs)    // ["diun"]
 * console.log(pkg.versions[0]) // "4.31.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crazymax-dev/diun.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const crazymaxdevdiunPackage = {
  /**
   * The display name of this package.
   */
  name: 'diun' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crazymax.dev/diun' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Receive notifications when an image is updated on a Docker registry' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crazymax.dev/diun/package.yml' as const,
  homepageUrl: 'https://crazymax.dev/diun/' as const,
  githubUrl: 'https://github.com/crazy-max/diun' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crazymax.dev/diun' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crazymax.dev/diun -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crazymax.dev/diun' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'diun',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.31.0',
    '4.30.0',
    '4.29.0',
    '4.28.0',
  ] as const,
  aliases: [] as const,
}

export type CrazymaxdevdiunPackage = typeof crazymaxdevdiunPackage
