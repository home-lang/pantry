/**
 * **dateutil** - Useful extensions to the standard Python datetime features
 *
 * @domain `github.com/dateutil/dateutil`
 * @version `2.9.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/dateutil/dateutil`
 * @dependencies `github.com/benjaminp/six^1.16`, `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdateutildateutil
 * console.log(pkg.name)        // "dateutil"
 * console.log(pkg.description) // "Useful extensions to the standard Python dateti..."
 * console.log(pkg.versions[0]) // "2.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/dateutil/dateutil.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dateutilPackage = {
  /**
   * The display name of this package.
   */
  name: 'dateutil' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/dateutil/dateutil' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Useful extensions to the standard Python datetime features' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dateutil/dateutil/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/dateutil/dateutil' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/dateutil/dateutil' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/dateutil/dateutil -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/dateutil/dateutil' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/benjaminp/six^1.16',
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.9.0',
    '2.8.2',
  ] as const,
  aliases: [] as const,
}

export type DateutilPackage = typeof dateutilPackage
