/**
 * **networkx** - Network Analysis in Python
 *
 * @domain `networkx.org`
 * @version `3.6.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install networkx.org`
 * @homepage https://networkx.org
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.networkxorg
 * console.log(pkg.name)        // "networkx"
 * console.log(pkg.description) // "Network Analysis in Python"
 * console.log(pkg.versions[0]) // "3.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/networkx-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const networkxorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'networkx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'networkx.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Network Analysis in Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/networkx.org/package.yml' as const,
  homepageUrl: 'https://networkx.org' as const,
  githubUrl: 'https://github.com/networkx/networkx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install networkx.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +networkx.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install networkx.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.6.1',
    '3.6.0',
    '3.5.0',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.0',
    '3.2.1',
  ] as const,
  aliases: [] as const,
}

export type NetworkxorgPackage = typeof networkxorgPackage
