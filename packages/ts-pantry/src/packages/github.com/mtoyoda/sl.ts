/**
 * **sl** - SL(1): Cure your bad habit of mistyping
 *
 * @domain `github.com/mtoyoda/sl`
 * @programs `sl`
 * @version `5.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mtoyoda/sl`
 * @dependencies `invisible-island.net/ncurses@6`
 * @buildDependencies `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommtoyodasl
 * console.log(pkg.name)        // "sl"
 * console.log(pkg.description) // "SL(1): Cure your bad habit of mistyping"
 * console.log(pkg.programs)    // ["sl"]
 * console.log(pkg.versions[0]) // "5.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mtoyoda/sl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const slPackage = {
  /**
   * The display name of this package.
   */
  name: 'sl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mtoyoda/sl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'SL(1): Cure your bad habit of mistyping' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mtoyoda/sl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mtoyoda/sl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mtoyoda/sl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mtoyoda/sl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mtoyoda/sl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses@6',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.2.0',
  ] as const,
  aliases: [] as const,
}

export type SlPackage = typeof slPackage
