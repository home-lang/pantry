/**
 * **getfoundry.sh** - Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.
 *
 * @domain `getfoundry.sh`
 * @programs `forge`, `anvil`, `cast`, `chisel`
 * @version `2024.4.12` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getfoundry.sh`
 * @homepage https://getfoundry.sh
 * @dependencies `git-scm.org^2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getfoundrysh
 * console.log(pkg.name)        // "getfoundry.sh"
 * console.log(pkg.description) // "Foundry is a blazing fast, portable and modular..."
 * console.log(pkg.programs)    // ["forge", "anvil", ...]
 * console.log(pkg.versions[0]) // "2024.4.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getfoundry-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getfoundryshPackage = {
  /**
   * The display name of this package.
   */
  name: 'getfoundry.sh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'getfoundry.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getfoundry.sh/package.yml' as const,
  homepageUrl: 'https://getfoundry.sh' as const,
  githubUrl: 'https://github.com/foundry-rs/foundry' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install getfoundry.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getfoundry.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getfoundry.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'forge',
    'anvil',
    'cast',
    'chisel',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'git-scm.org^2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2024.4.12',
    '2023.12.7',
    '2023.7.16',
    '1.5.1',
    '1.5.0',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.1',
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type GetfoundryshPackage = typeof getfoundryshPackage
