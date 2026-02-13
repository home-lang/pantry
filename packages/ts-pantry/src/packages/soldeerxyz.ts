/**
 * **soldeer** - Solidity Package Manager written in rust and integrated into Foundry (forge soldeer ...)
 *
 * @domain `soldeer.xyz`
 * @programs `soldeer`
 * @version `0.10.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install soldeer.xyz`
 * @homepage https://soldeer.xyz
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.soldeerxyz
 * console.log(pkg.name)        // "soldeer"
 * console.log(pkg.description) // "Solidity Package Manager written in rust and in..."
 * console.log(pkg.programs)    // ["soldeer"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/soldeer-xyz.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install soldeer.xyz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +soldeer.xyz -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install soldeer.xyz' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
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
  ] as const,
  aliases: [] as const,
}

export type SoldeerxyzPackage = typeof soldeerxyzPackage
