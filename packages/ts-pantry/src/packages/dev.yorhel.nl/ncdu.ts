/**
 * **ncdu** - NCurses Disk Usage
 *
 * @domain `dev.yorhel.nl/ncdu`
 * @programs `ncdu`
 * @version `1.22.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dev.yorhel.nl/ncdu`
 * @homepage https://dev.yorhel.nl/ncdu
 * @dependencies `invisible-island.net/ncurses`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.devyorhelnlncdu
 * console.log(pkg.name)        // "ncdu"
 * console.log(pkg.description) // "NCurses Disk Usage"
 * console.log(pkg.programs)    // ["ncdu"]
 * console.log(pkg.versions[0]) // "1.22.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dev-yorhel-nl/ncdu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const devyorhelnlncduPackage = {
  /**
   * The display name of this package.
   */
  name: 'ncdu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dev.yorhel.nl/ncdu' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'NCurses Disk Usage' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dev.yorhel.nl/ncdu/package.yml' as const,
  homepageUrl: 'https://dev.yorhel.nl/ncdu' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dev.yorhel.nl/ncdu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dev.yorhel.nl/ncdu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dev.yorhel.nl/ncdu' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ncdu',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.1',
  ] as const,
  aliases: [] as const,
}

export type DevyorhelnlncduPackage = typeof devyorhelnlncduPackage
