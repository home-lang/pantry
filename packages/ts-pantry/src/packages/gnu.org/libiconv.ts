/**
 * **iconv** - pkgx package
 *
 * @domain `gnu.org/libiconv`
 * @programs `iconv`
 * @version `1.18.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/libiconv`
 * @dependencies `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorglibiconv
 * console.log(pkg.name)        // "iconv"
 * console.log(pkg.programs)    // ["iconv"]
 * console.log(pkg.versions[0]) // "1.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/libiconv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorglibiconvPackage = {
  /**
  * The display name of this package.
  */
  name: 'iconv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/libiconv' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libiconv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/libiconv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/libiconv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/libiconv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'iconv',
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
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.18.0',
    '1.17.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorglibiconvPackage = typeof gnuorglibiconvPackage
