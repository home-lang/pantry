/**
 * **z3** - High-performance theorem prover
 *
 * @domain `github.com/Z3Prover/z3`
 * @programs `z3`
 * @version `4.15.8` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Z3Prover/z3`
 * @dependencies `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `python.org@>=3<3.12`, `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomz3proverz3
 * console.log(pkg.name)        // "z3"
 * console.log(pkg.description) // "High-performance theorem prover"
 * console.log(pkg.programs)    // ["z3"]
 * console.log(pkg.versions[0]) // "4.15.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Z3Prover/z3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const z3Package = {
  /**
  * The display name of this package.
  */
  name: 'z3' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/Z3Prover/z3' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'High-performance theorem prover' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Z3Prover/z3/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Z3Prover/z3' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/Z3Prover/z3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Z3Prover/z3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Z3Prover/z3' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'z3',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@^3',
    'python.org@>=3<3.12',
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.15.8',
    '4.15.7',
    '4.15.6',
    '4.15.5',
    '4.15.4',
    '4.15.3',
    '4.15.2',
    '4.15.1',
    '4.15.0',
    '4.14.1',
    '4.14.0',
    '4.13.4',
    '4.13.3',
    '4.13.2',
    '4.13.0',
    '4.12.6',
    '4.12.5',
    '4.12.4',
    '4.12.3',
    '4.12.2',
    '4.12.1',
  ] as const,
  aliases: [] as const,
}

export type Z3Package = typeof z3Package
