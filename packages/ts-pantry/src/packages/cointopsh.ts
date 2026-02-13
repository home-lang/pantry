/**
 * **cointop** - A fast and lightweight interactive terminal based UI application for tracking cryptocurrencies 🚀
 *
 * @domain `cointop.sh`
 * @programs `cointop`
 * @version `1.6.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cointop.sh`
 * @homepage https://cointop.sh
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.17` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cointopsh
 * console.log(pkg.name)        // "cointop"
 * console.log(pkg.description) // "A fast and lightweight interactive terminal bas..."
 * console.log(pkg.programs)    // ["cointop"]
 * console.log(pkg.versions[0]) // "1.6.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cointop-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cointopshPackage = {
  /**
   * The display name of this package.
   */
  name: 'cointop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cointop.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast and lightweight interactive terminal based UI application for tracking cryptocurrencies 🚀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cointop.sh/package.yml' as const,
  homepageUrl: 'https://cointop.sh' as const,
  githubUrl: 'https://github.com/cointop-sh/cointop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cointop.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cointop.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cointop.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cointop',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.17',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.10',
  ] as const,
  aliases: [] as const,
}

export type CointopshPackage = typeof cointopshPackage
