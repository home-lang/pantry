/**
 * **fullycapable** - pkgx package
 *
 * @domain `google.com/fullycapable`
 * @programs `capsh`, `getcap`, `getpcaps`, `setcap`
 * @version `2.66.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/fullycapable`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomfullycapable
 * console.log(pkg.name)        // "fullycapable"
 * console.log(pkg.programs)    // ["capsh", "getcap", ...]
 * console.log(pkg.versions[0]) // "2.66.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/fullycapable.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomfullycapablePackage = {
  /**
   * The display name of this package.
   */
  name: 'fullycapable' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'google.com/fullycapable' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/fullycapable/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install google.com/fullycapable' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/fullycapable -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/fullycapable' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'capsh',
    'getcap',
    'getpcaps',
    'setcap',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.66.0',
  ] as const,
  aliases: [] as const,
}

export type GooglecomfullycapablePackage = typeof googlecomfullycapablePackage
