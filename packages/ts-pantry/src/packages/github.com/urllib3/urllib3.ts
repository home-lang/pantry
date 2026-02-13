/**
 * **urllib3** - urllib3 is a user-friendly HTTP client library for Python
 *
 * @domain `github.com/urllib3/urllib3`
 * @version `2.6.3` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/urllib3/urllib3`
 * @homepage https://urllib3.readthedocs.io
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomurllib3urllib3
 * console.log(pkg.name)        // "urllib3"
 * console.log(pkg.description) // "urllib3 is a user-friendly HTTP client library ..."
 * console.log(pkg.versions[0]) // "2.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/urllib3/urllib3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const urllib3Package = {
  /**
   * The display name of this package.
   */
  name: 'urllib3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/urllib3/urllib3' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'urllib3 is a user-friendly HTTP client library for Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/urllib3/urllib3/package.yml' as const,
  homepageUrl: 'https://urllib3.readthedocs.io' as const,
  githubUrl: 'https://github.com/urllib3/urllib3' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/urllib3/urllib3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/urllib3/urllib3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/urllib3/urllib3' as const,
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
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '1.26.20',
    '1.26.19',
  ] as const,
  aliases: [] as const,
}

export type Urllib3Package = typeof urllib3Package
