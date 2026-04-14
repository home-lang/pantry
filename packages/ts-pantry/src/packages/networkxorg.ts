/**
 * **networkx** - Network Analysis in Python
 *
 * @domain `networkx.org`
 * @version `3.6.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install networkx.org`
 * @homepage https://networkx.org
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.networkxorg
 * console.log(pkg.name)        // "networkx"
 * console.log(pkg.description) // "Network Analysis in Python"
 * console.log(pkg.versions[0]) // "3.6.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/networkx-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install networkx.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +networkx.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install networkx.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.1',
    '3.6',
    '3.6.0',
    '3.5',
    '3.5.0',
    '3.4.2',
    '3.4.1',
    '3.4',
    '3.4.0',
    '3.3',
    '3.3.0',
    '3.2.1',
    '3.2',
    '3.1',
    '3.0',
    '2.8.8',
    '2.8.7',
    '2.8.6',
    '2.8.5',
    '2.8.4',
    '2.8.3',
    '2.8.2',
    '2.8.1',
    '2.8',
    '2.7.1',
    '2.7',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6',
    '2.5.1',
    '2.5',
    '2.4',
    '2.3',
    '2.2',
  ] as const,
  aliases: [] as const,
}

export type NetworkxorgPackage = typeof networkxorgPackage
