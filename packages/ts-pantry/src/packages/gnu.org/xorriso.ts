/**
 * **xorriso** - ISO 9660 Rock Ridge filesystem manipulator
 *
 * @domain `gnu.org/xorriso`
 * @programs `xorriso`, `xorrisofs`, `xorrecord`, `osirrox`
 * @version `1.5.6` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gnu.org/xorriso`
 * @homepage https://www.gnu.org/software/xorriso/
 * @buildDependencies `freedesktop.org/pkg-config` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgxorriso
 * console.log(pkg.name)        // "xorriso"
 * console.log(pkg.description) // "ISO 9660 Rock Ridge filesystem manipulator"
 * console.log(pkg.programs)    // ["xorriso", "xorrisofs", "xorrecord", "osirrox"]
 * console.log(pkg.versions[0]) // "1.5.6" (latest)
 * ```
 *
 * @see https://www.gnu.org/software/xorriso/
 */
export const gnuorgxorrisoPackage = {
  /**
  * The display name of this package.
  */
  name: 'xorriso' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/xorriso' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'ISO 9660 Rock Ridge filesystem manipulator' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.gnu.org/software/xorriso/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  */
  installCommand: 'pantry install gnu.org/xorriso' as const,
  pkgxInstallCommand: '' as const,
  launchpadInstallCommand: 'pantry install gnu.org/xorriso' as const,
  /**
  * Executable programs provided by this package.
  */
  programs: [
    'xorriso',
    'xorrisofs',
    'xorrecord',
    'osirrox',
  ] as const,
  companions: [] as const,
  dependencies: [
    'zlib.net',
    'sourceware.org/bzip2',
    'gnu.org/readline',
  ] as const,
  /**
  * Build dependencies for this package.
  */
  buildDependencies: [
    'freedesktop.org/pkg-config',
  ] as const,
  /**
  * Available versions from newest to oldest.
  */
  versions: [
    '1.5.6',
    '1.5.4',
    '1.5.2',
    '1.5.0',
    '1.4.8',
    '1.4.6',
  ] as const,
  aliases: [] as const,
}

export type GnuorgxorrisoPackage = typeof gnuorgxorrisoPackage
