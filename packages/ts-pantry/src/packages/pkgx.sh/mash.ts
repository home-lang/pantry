/**
 * **mash** - mash up millions of open source packages into monstrously powerful scripts
 *
 * @domain `pkgx.sh/mash`
 * @programs `mash`
 * @version `0.4.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pkgx.sh/mash`
 * @homepage https://mash.pkgx.sh
 * @dependencies `pkgx.sh^1.1,^2`, `gnu.org/bash`, `curl.se`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pkgxshmash
 * console.log(pkg.name)        // "mash"
 * console.log(pkg.description) // "mash up millions of open source packages into m..."
 * console.log(pkg.programs)    // ["mash"]
 * console.log(pkg.versions[0]) // "0.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pkgx-sh/mash.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pkgxshmashPackage = {
  /**
   * The display name of this package.
   */
  name: 'mash' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pkgx.sh/mash' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'mash up millions of open source packages into monstrously powerful scripts' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/mash/package.yml' as const,
  homepageUrl: 'https://mash.pkgx.sh' as const,
  githubUrl: 'https://github.com/pkgxdev/mash' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pkgx.sh/mash' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pkgx.sh/mash -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pkgx.sh/mash' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mash',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1.1,^2',
    'gnu.org/bash',
    'curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type PkgxshmashPackage = typeof pkgxshmashPackage
