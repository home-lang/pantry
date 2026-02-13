/**
 * **qsv** - Ultra-fast CSV data-wrangling toolkit
 *
 * @domain `crates.io/qsv`
 * @programs `qsv`
 * @version `14.0.0` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/qsv`
 * @homepage https://qsv.dathere.com
 * @dependencies `linux:wayland.freedesktop.org` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `python.org@>=3.8` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioqsv
 * console.log(pkg.name)        // "qsv"
 * console.log(pkg.description) // "Ultra-fast CSV data-wrangling toolkit"
 * console.log(pkg.programs)    // ["qsv"]
 * console.log(pkg.versions[0]) // "14.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/qsv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioqsvPackage = {
  /**
   * The display name of this package.
   */
  name: 'qsv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/qsv' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Ultra-fast CSV data-wrangling toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/qsv/package.yml' as const,
  homepageUrl: 'https://qsv.dathere.com' as const,
  githubUrl: 'https://github.com/dathere/qsv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/qsv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/qsv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/qsv' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'qsv',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:wayland.freedesktop.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'python.org@>=3.8',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '14.0.0',
    '13.0.0',
    '12.0.0',
    '11.0.2',
    '10.0.0',
    '9.1.0',
    '8.1.1',
    '8.1.0',
    '8.0.0',
    '7.1.0',
    '7.0.1',
    '7.0.0',
    '6.0.1',
    '6.0.0',
    '5.1.0',
    '5.0.3',
    '4.0.0',
    '3.3.0',
    '3.2.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioqsvPackage = typeof cratesioqsvPackage
