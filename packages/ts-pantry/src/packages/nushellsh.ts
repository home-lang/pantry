/**
 * **nu** - Modern shell for the GitHub era
 *
 * @domain `nushell.sh`
 * @programs `nu`
 * @version `0.110.0` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nushell.sh`
 * @homepage https://www.nushell.sh
 * @dependencies `openssl.org^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.nushellsh
 * console.log(pkg.name)        // "nu"
 * console.log(pkg.description) // "Modern shell for the GitHub era"
 * console.log(pkg.programs)    // ["nu"]
 * console.log(pkg.versions[0]) // "0.110.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nushell-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nushellshPackage = {
  /**
   * The display name of this package.
   */
  name: 'nu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nushell.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modern shell for the GitHub era' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nushell.sh/package.yml' as const,
  homepageUrl: 'https://www.nushell.sh' as const,
  githubUrl: 'https://github.com/nushell/nushell' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install nushell.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nushell.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nushell.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nu',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.110.0',
    '0.109.1',
    '0.109.0',
    '0.108.0',
    '0.107.0',
    '0.106.1',
    '0.106.0',
    '0.105.1',
    '0.105.0',
    '0.104.1',
    '0.104.0',
    '0.103.0',
    '0.102.0',
    '0.101.0',
    '0.100.0',
    '0.99.1',
    '0.99.0',
    '0.98.0',
    '0.97.1',
    '0.97.0',
    '0.96.1',
    '0.96.0',
    '0.95.0',
    '0.94.2',
    '0.94.1',
    '0.94.0',
    '0.93.0',
    '0.92.2',
    '0.92.1',
    '0.92.0',
    '0.91.0',
    '0.90.1',
    '0.90.0',
    '0.89.0',
    '0.88.1',
    '0.88.0',
    '0.87.1',
    '0.87.0',
    '0.86.0',
    '0.85.0',
    '0.84.0',
    '0.83.1',
    '0.83.0',
    '0.82.0',
    '0.81.0',
    '0.80.0',
    '0.79.0',
    '0.78.0',
    '0.77.1',
    '0.77.0',
    '0.76.0',
    '0.75.0',
    '0.74.0',
    '0.73.0',
    '0.72.1',
  ] as const,
  aliases: [] as const,
}

export type NushellshPackage = typeof nushellshPackage
