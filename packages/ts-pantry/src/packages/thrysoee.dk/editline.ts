/**
 * **editline** - pkgx package
 *
 * @domain `thrysoee.dk/editline`
 * @version `3.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install thrysoee.dk/editline`
 * @dependencies `invisible-island.net/ncurses`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.thrysoeedkeditline
 * console.log(pkg.name)        // "editline"
 * console.log(pkg.versions[0]) // "3.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/thrysoee-dk/editline.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const thrysoeedkeditlinePackage = {
  /**
   * The display name of this package.
   */
  name: 'editline' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'thrysoee.dk/editline' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/thrysoee.dk/editline/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install thrysoee.dk/editline' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +thrysoee.dk/editline -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install thrysoee.dk/editline' as const,
  programs: [] as const,
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
    '3.1.0',
  ] as const,
  aliases: [] as const,
}

export type ThrysoeedkeditlinePackage = typeof thrysoeedkeditlinePackage
