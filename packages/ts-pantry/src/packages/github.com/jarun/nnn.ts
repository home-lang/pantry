/**
 * **nnn** - Tiny, lightning fast, feature-packed file manager
 *
 * @domain `github.com/jarun/nnn`
 * @programs `nnn`
 * @version `5.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jarun/nnn`
 * @dependencies `invisible-island.net/ncurses@6`, `gnu.org/readline@8`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjarunnnn
 * console.log(pkg.name)        // "nnn"
 * console.log(pkg.description) // "Tiny, lightning fast, feature-packed file manager"
 * console.log(pkg.programs)    // ["nnn"]
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jarun/nnn.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nnnPackage = {
  /**
   * The display name of this package.
   */
  name: 'nnn' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/jarun/nnn' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tiny, lightning fast, feature-packed file manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jarun/nnn/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jarun/nnn' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/jarun/nnn' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jarun/nnn -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jarun/nnn' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nnn',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses@6',
    'gnu.org/readline@8',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.0',
    '5.0.0',
  ] as const,
  aliases: [] as const,
}

export type NnnPackage = typeof nnnPackage
