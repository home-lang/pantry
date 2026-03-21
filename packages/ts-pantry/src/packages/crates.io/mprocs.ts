/**
 * **mprocs** - Run multiple commands in parallel
 *
 * @domain `crates.io/mprocs`
 * @programs `mprocs`
 * @version `0.9.2` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/mprocs`
 * @buildDependencies `linux:gnu.org/gcc`, `linux:gnu.org/binutils`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesiomprocs
 * console.log(pkg.name)        // "mprocs"
 * console.log(pkg.description) // "Run multiple commands in parallel"
 * console.log(pkg.programs)    // ["mprocs"]
 * console.log(pkg.versions[0]) // "0.9.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/mprocs.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cratesiomprocsPackage = {
  /**
  * The display name of this package.
  */
  name: 'mprocs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/mprocs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Run multiple commands in parallel' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mprocs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/pvolok/mprocs' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/mprocs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/mprocs -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/mprocs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mprocs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils',
    'linux:gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.4',
  ] as const,
  aliases: [] as const,
}

export type CratesiomprocsPackage = typeof cratesiomprocsPackage
