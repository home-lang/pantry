/**
 * **gcc** - pkgx package
 *
 * @domain `gnu.org/gcc`
 * @programs `ar`, `cc`, `c++`, `gc++`, `cpp`, ... (+12 more)
 * @version `15.2.0` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/gcc`
 * @dependencies `gnu.org/binutils`, `gnu.org/gmp>=4.2`, `gnu.org/mpfr>=2.4.0`, ... (+3 more)
 * @buildDependencies `linux:gnu.org/gcc`, `gnu.org/make`, `perl.org@^5.6.1`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggcc
 * console.log(pkg.name)        // "gcc"
 * console.log(pkg.programs)    // ["ar", "cc", ...]
 * console.log(pkg.versions[0]) // "15.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/gcc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggccPackage = {
  /**
   * The display name of this package.
   */
  name: 'gcc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/gcc' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gcc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/gcc-mirror/gcc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/gcc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gcc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/gcc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ar',
    'cc',
    'c++',
    'gc++',
    'cpp',
    'g++',
    'gcc',
    'gcc-ar',
    'gcc-nm',
    'gcc-ranlib',
    'gcov',
    'gcov-dump',
    'gcov-tool',
    'gfortran',
    'lto-dump',
    'nm',
    'ranlib',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/binutils',
    'gnu.org/gmp>=4.2',
    'gnu.org/mpfr>=2.4.0',
    'gnu.org/mpc>=0.8.0',
    'zlib.net^1.3',
    'darwin/x86-64^# since 15.1.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'gnu.org/make',
    'perl.org@^5.6.1',
    'gnu.org/patch',
    'curl.se',
    'github.com/westes/flex',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '15.2.0',
    '15.1.0',
    '14.3.0',
    '14.2.0',
    '14.1.0',
    '13.3.0',
    '13.2.0',
    '13.1.0',
    '12.5.0',
    '12.4.0',
    '12.3.0',
    '12.2.0',
    '11.4.0',
    '10.5.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggccPackage = typeof gnuorggccPackage
