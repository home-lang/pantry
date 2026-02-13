/**
 * **libksba** - pkgx package
 *
 * @domain `gnupg.org/libksba`
 * @version `1.6.7` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/libksba`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorglibksba
 * console.log(pkg.name)        // "libksba"
 * console.log(pkg.versions[0]) // "1.6.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/libksba.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorglibksbaPackage = {
  /**
   * The display name of this package.
   */
  name: 'libksba' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnupg.org/libksba' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libksba/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnupg.org/libksba' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/libksba -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/libksba' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.7',
    '1.6.6',
    '1.6.5',
    '1.6.4',
    '1.6.3',
    '1.6.1',
  ] as const,
  aliases: [] as const,
}

export type GnupgorglibksbaPackage = typeof gnupgorglibksbaPackage
