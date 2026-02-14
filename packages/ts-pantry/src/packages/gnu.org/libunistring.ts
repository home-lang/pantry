/**
 * **libunistring** - pkgx package
 *
 * @domain `gnu.org/libunistring`
 * @version `1.4.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/libunistring`
 * @dependencies `darwin:gnu.org/libiconv` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/gmp`, `gnu.org/m4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorglibunistring
 * console.log(pkg.name)        // "libunistring"
 * console.log(pkg.versions[0]) // "1.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/libunistring.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorglibunistringPackage = {
  /**
  * The display name of this package.
  */
  name: 'libunistring' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/libunistring' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libunistring/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/libunistring' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/libunistring -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/libunistring' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'darwin:gnu.org/libiconv',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gmp',
    'gnu.org/m4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorglibunistringPackage = typeof gnuorglibunistringPackage
