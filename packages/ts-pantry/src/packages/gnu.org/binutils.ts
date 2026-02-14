/**
 * **binutils** - GNU binary tools for native development
 *
 * @domain `gnu.org/binutils`
 * @programs `addr2line`, `ar`, `c++filt`, `elfedit`, `nm`, ... (+7 more)
 * @version `2.46.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/binutils`
 * @homepage https://www.gnu.org/software/binutils/binutils.html
 * @buildDependencies `gnu.org/bison`, `gnu.org/texinfo`, `facebook.com/zstd`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgbinutils
 * console.log(pkg.name)        // "binutils"
 * console.log(pkg.description) // "GNU binary tools for native development"
 * console.log(pkg.programs)    // ["addr2line", "ar", ...]
 * console.log(pkg.versions[0]) // "2.46.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/binutils.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgbinutilsPackage = {
  /**
  * The display name of this package.
  */
  name: 'binutils' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/binutils' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU binary tools for native development' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/binutils/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/binutils/binutils.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/binutils' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/binutils -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/binutils' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'addr2line',
    'ar',
    'c++filt',
    'elfedit',
    'nm',
    'objcopy',
    'objdump',
    'ranlib',
    'readelf',
    'size',
    'strings',
    'strip',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/texinfo',
    'facebook.com/zstd',
    'linux:gnu.org/gcc',
    'linux:perl.org@~5.40',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.46.0',
    '2.45.1',
    '2.45.0',
    '2.44.0',
    '2.43.1',
    '2.43.0',
    '2.42.0',
    '2.41.0',
    '2.40.0',
    '2.39.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgbinutilsPackage = typeof gnuorgbinutilsPackage
