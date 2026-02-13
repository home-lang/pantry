/**
 * **six** - Python 2 and 3 compatibility library
 *
 * @domain `github.com/benjaminp/six`
 * @version `1.17.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/benjaminp/six`
 * @homepage https://six.readthedocs.io/
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombenjaminpsix
 * console.log(pkg.name)        // "six"
 * console.log(pkg.description) // "Python 2 and 3 compatibility library"
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/benjaminp/six.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sixPackage = {
  /**
   * The display name of this package.
   */
  name: 'six' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/benjaminp/six' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python 2 and 3 compatibility library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/benjaminp/six/package.yml' as const,
  homepageUrl: 'https://six.readthedocs.io/' as const,
  githubUrl: 'https://github.com/benjaminp/six' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/benjaminp/six' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/benjaminp/six -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/benjaminp/six' as const,
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
    '1.17.0',
    '1.16.0',
  ] as const,
  aliases: [] as const,
}

export type SixPackage = typeof sixPackage
