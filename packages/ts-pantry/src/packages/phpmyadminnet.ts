/**
 * **phpMyAdmin** - pkgx package
 *
 * @domain `phpmyadmin.net`
 * @version `5.2.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install phpmyadmin.net`
 * @dependencies `php.net`
 * @buildDependencies `php.net` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.phpmyadminnet
 * console.log(pkg.name)        // "phpMyAdmin"
 * console.log(pkg.versions[0]) // "5.2.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/phpmyadmin-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const phpmyadminnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'phpMyAdmin' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'phpmyadmin.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/phpmyadmin.net/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install phpmyadmin.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +phpmyadmin.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install phpmyadmin.net' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'php.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'php.net',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.2.3',
    '5.2.2',
    '5.2.1',
  ] as const,
  aliases: [] as const,
}

export type PhpmyadminnetPackage = typeof phpmyadminnetPackage
