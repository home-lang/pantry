/**
 * **iroh** - peer-2-peer that just works
 *
 * @domain `iroh.computer`
 * @programs `iroh`
 * @version `0.97.0` (50 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install iroh.computer`
 * @homepage https://iroh.computer
 * @buildDependencies `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.irohcomputer
 * console.log(pkg.name)        // "iroh"
 * console.log(pkg.description) // "peer-2-peer that just works"
 * console.log(pkg.programs)    // ["iroh"]
 * console.log(pkg.versions[0]) // "0.97.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/iroh-computer.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const irohcomputerPackage = {
  /**
  * The display name of this package.
  */
  name: 'iroh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'iroh.computer' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'peer-2-peer that just works' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/iroh.computer/package.yml' as const,
  homepageUrl: 'https://iroh.computer' as const,
  githubUrl: 'https://github.com/n0-computer/iroh' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install iroh.computer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +iroh.computer -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install iroh.computer' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'iroh',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.97.0',
    '0.96.1',
    '0.96.0',
    '0.95.1',
    '0.95.0',
    '0.94.1',
    '0.94.0',
    '0.93.2',
    '0.93.1',
    '0.93.0',
    '0.92.0',
    '0.91.2',
    '0.91.1',
    '0.91.0',
    '0.90.0',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.1',
  ] as const,
  aliases: [] as const,
}

export type IrohcomputerPackage = typeof irohcomputerPackage
