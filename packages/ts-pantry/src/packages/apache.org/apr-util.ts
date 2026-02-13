/**
 * **apu-{{ version.major }}-config** - Mirror of Apache Portable Runtime util
 *
 * @domain `apache.org/apr-util`
 * @programs `apu-{{ version.major }}-config`
 * @version `1.6.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/apr-util`
 * @buildDependencies `apache.org/apr`, `openssl.org`, `libexpat.github.io`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgaprutil
 * console.log(pkg.name)        // "apu-{{ version.major }}-config"
 * console.log(pkg.description) // "Mirror of Apache Portable Runtime util"
 * console.log(pkg.programs)    // ["apu-{{ version.major }}-config"]
 * console.log(pkg.versions[0]) // "1.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/apr-util.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgaprutilPackage = {
  /**
   * The display name of this package.
   */
  name: 'apu-{{ version.major }}-config' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/apr-util' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Mirror of Apache Portable Runtime util' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/apr-util/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/apache/apr-util' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/apr-util' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/apr-util -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/apr-util' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'apu-{{ version.major }}-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'apache.org/apr',
    'openssl.org',
    'libexpat.github.io',
    'sqlite.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.3',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgaprutilPackage = typeof apacheorgaprutilPackage
