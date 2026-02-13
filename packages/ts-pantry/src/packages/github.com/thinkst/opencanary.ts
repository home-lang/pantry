/**
 * **opencanaryd** - Modular and decentralised honeypot
 *
 * @domain `github.com/thinkst/opencanary`
 * @programs `opencanaryd`
 * @version `0.9.7` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/thinkst/opencanary`
 * @homepage http://opencanary.org
 * @dependencies `python.org>=3.10<3.12`, `tcpdump.org`, `openssl.org`
 * @buildDependencies `pip.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomthinkstopencanary
 * console.log(pkg.name)        // "opencanaryd"
 * console.log(pkg.description) // "Modular and decentralised honeypot"
 * console.log(pkg.programs)    // ["opencanaryd"]
 * console.log(pkg.versions[0]) // "0.9.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/thinkst/opencanary.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opencanaryPackage = {
  /**
   * The display name of this package.
   */
  name: 'opencanaryd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/thinkst/opencanary' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modular and decentralised honeypot' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thinkst/opencanary/package.yml' as const,
  homepageUrl: 'http://opencanary.org' as const,
  githubUrl: 'https://github.com/thinkst/opencanary' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/thinkst/opencanary' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/thinkst/opencanary -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/thinkst/opencanary' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'opencanaryd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.10<3.12',
    'tcpdump.org',
    'openssl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'pip.pypa.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
  ] as const,
  aliases: [] as const,
}

export type OpencanaryPackage = typeof opencanaryPackage
