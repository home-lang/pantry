/**
 * **libgomp** - pkgx package
 *
 * @domain `gnu.org/gcc/libgomp`
 * @version `15.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/gcc/libgomp`
 * @dependencies `gnu.org/binutils`, `gnu.org/gmp>=4.2`, `gnu.org/mpfr>=2.4.0`, ... (+3 more)
 * @buildDependencies `linux:gnu.org/gcc`, `gnu.org/make`, `perl.org@^5.6.1`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggcclibgomp
 * console.log(pkg.name)        // "libgomp"
 * console.log(pkg.versions[0]) // "15.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/gcc/libgomp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggcclibgompPackage = {
  /**
  * The display name of this package.
  */
  name: 'libgomp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/gcc/libgomp' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gcc/libgomp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/gcc/libgomp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gcc/libgomp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/gcc/libgomp' as const,
  programs: [] as const,
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
  ] as const,
  aliases: [] as const,
}

export type GnuorggcclibgompPackage = typeof gnuorggcclibgompPackage
