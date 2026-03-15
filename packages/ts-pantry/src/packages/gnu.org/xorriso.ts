/**
 * **xorriso** - pkgx package
 *
 * @domain `gnu.org/xorriso`
 *
 * @install `launchpad install gnu.org/xorriso`
 * @dependencies `zlib.net`, `sourceware.org/bzip2`, `gnu.org/readline`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgxorriso
 * console.log(pkg.name)        // "xorriso"
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/xorriso.md
 * @see https://ts-pkgx.netlify.app/usage
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
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/xorriso/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/xorriso/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/xorriso' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/xorriso -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/xorriso' as const,
  programs: [
    'xorriso',
    'xorrisofs',
    'xorrecord',
    'osirrox',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net',
    'sourceware.org/bzip2',
    'gnu.org/readline',
  ] as const,
  buildDependencies: [] as const,
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
