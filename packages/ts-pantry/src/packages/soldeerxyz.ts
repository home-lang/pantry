/**
 * **soldeer** - Solidity Package Manager written in rust and integrated into Foundry (forge soldeer ...)
 *
 * @domain `soldeer.xyz`
 * @programs `soldeer`
 * @version `0.10.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install soldeer.xyz`
 * @homepage https://soldeer.xyz
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.soldeerxyz
 * console.log(pkg.name)        // "soldeer"
 * console.log(pkg.description) // "Solidity Package Manager written in rust and in..."
 * console.log(pkg.programs)    // ["soldeer"]
 * console.log(pkg.versions[0]) // "0.10.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/soldeer-xyz.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const soldeerxyzPackage = {
  /**
  * The display name of this package.
  */
  name: 'soldeer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'soldeer.xyz' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Solidity Package Manager written in rust and integrated into Foundry (forge soldeer ...)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/soldeer.xyz/package.yml' as const,
  homepageUrl: 'https://soldeer.xyz' as const,
  githubUrl: 'https://github.com/mario-eth/soldeer' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install soldeer.xyz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +soldeer.xyz -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install soldeer.xyz' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'soldeer',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.1',
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.1',
    '0.6.0',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.19',
    '0.2.18',
    '0.2.17',
    '0.2.16',
    '0.2.15',
    '0.2.14',
    '0.2.13',
    '0.2.12',
    '0.2.11',
    '0.2.10',
    '0.2.9',
    '0.2.8',
    '0.2.7',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type SoldeerxyzPackage = typeof soldeerxyzPackage
