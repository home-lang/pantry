/**
 * **libmatio** - C library for reading and writing MATLAB MAT files
 *
 * @domain `matio.sourceforge.io`
 * @programs `matdump`
 * @version `1.5.30` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install matio.sourceforge.io`
 * @homepage https://matio.sourceforge.net/
 * @dependencies `hdfgroup.org/HDF5`, `zlib.net`
 * @buildDependencies `cmake.org`, `darwin:llvm.org@20` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.matiosourceforgeio
 * console.log(pkg.name)        // "libmatio"
 * console.log(pkg.description) // "C library for reading and writing MATLAB MAT files"
 * console.log(pkg.programs)    // ["matdump"]
 * console.log(pkg.versions[0]) // "1.5.30" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/matio-sourceforge-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const matiosourceforgeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'libmatio' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'matio.sourceforge.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'C library for reading and writing MATLAB MAT files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/matio.sourceforge.io/package.yml' as const,
  homepageUrl: 'https://matio.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install matio.sourceforge.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +matio.sourceforge.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install matio.sourceforge.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'matdump',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'hdfgroup.org/HDF5',
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'darwin:llvm.org@20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.30',
    '1.5.29',
    '1.5.28',
    '1.5.27',
    '1.5.26',
    '1.5.25',
    '1.5.24',
    '1.5.23',
  ] as const,
  aliases: [] as const,
}

export type MatiosourceforgeioPackage = typeof matiosourceforgeioPackage
