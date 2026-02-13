/**
 * **psutil** - Cross-platform lib for process and system monitoring in Python
 *
 * @domain `github.com/giampaolo/psutil`
 * @version `7.2.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/giampaolo/psutil`
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgiampaolopsutil
 * console.log(pkg.name)        // "psutil"
 * console.log(pkg.description) // "Cross-platform lib for process and system monit..."
 * console.log(pkg.versions[0]) // "7.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/giampaolo/psutil.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const psutilPackage = {
  /**
   * The display name of this package.
   */
  name: 'psutil' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/giampaolo/psutil' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Cross-platform lib for process and system monitoring in Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/giampaolo/psutil/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/giampaolo/psutil' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/giampaolo/psutil' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/giampaolo/psutil -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/giampaolo/psutil' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.2.1',
    '7.2.0',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.0',
    '6.1.1',
    '6.1.0',
    '6.0.0',
    '5.9.8',
  ] as const,
  aliases: [] as const,
}

export type PsutilPackage = typeof psutilPackage
