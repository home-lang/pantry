/**
 * **harlequin.sh** - pkgx package
 *
 * @domain `harlequin.sh`
 * @version `2.5.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install harlequin.sh`
 * @dependencies `pkgx.sh^1`, `unixodbc.org`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.harlequinsh
 * console.log(pkg.name)        // "harlequin.sh"
 * console.log(pkg.versions[0]) // "2.5.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/harlequin-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const harlequinshPackage = {
  /**
   * The display name of this package.
   */
  name: 'harlequin.sh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'harlequin.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/harlequin.sh/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install harlequin.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +harlequin.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install harlequin.sh' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'unixodbc.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.1',
    '2.5.0',
    '2.4.1',
  ] as const,
  aliases: [] as const,
}

export type HarlequinshPackage = typeof harlequinshPackage
