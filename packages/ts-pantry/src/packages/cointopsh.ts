/**
 * **cointop** - A fast and lightweight interactive terminal based UI application for tracking cryptocurrencies 🚀
 *
 * @domain `cointop.sh`
 * @programs `cointop`
 * @version `1.6.10` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cointop.sh`
 * @homepage https://cointop.sh
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.17` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cointopsh
 * console.log(pkg.name)        // "cointop"
 * console.log(pkg.description) // "A fast and lightweight interactive terminal bas..."
 * console.log(pkg.programs)    // ["cointop"]
 * console.log(pkg.versions[0]) // "1.6.10" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/cointop-sh.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install cointop.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cointop.sh -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cointop.sh' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.10',
    '1.6.9',
    '1.6.8',
    '1.6.7',
    '1.6.6',
    '1.6.5',
    '1.6.4',
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.5',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
  ] as const,
  aliases: [] as const,
}

export type CointopshPackage = typeof cointopshPackage
