/**
 * **wimlib** - Library to create, extract, and modify Windows Imaging files
 *
 * @domain `wimlib.net`
 * @programs `mkwinpeimg`, `wimappend`, `wimapply`, `wimapply`, `wimdelete`, ... (+13 more)
 * @version `1.14.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wimlib.net`
 * @homepage https://wimlib.net/
 * @dependencies `openssl.org^3.1.0`, `gnome.org/libxml2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wimlibnet
 * console.log(pkg.name)        // "wimlib"
 * console.log(pkg.description) // "Library to create, extract, and modify Windows ..."
 * console.log(pkg.programs)    // ["mkwinpeimg", "wimappend", ...]
 * console.log(pkg.versions[0]) // "1.14.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wimlib-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wimlibnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'wimlib' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'wimlib.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library to create, extract, and modify Windows Imaging files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wimlib.net/package.yml' as const,
  homepageUrl: 'https://wimlib.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install wimlib.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wimlib.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wimlib.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mkwinpeimg',
    'wimappend',
    'wimapply',
    'wimapply',
    'wimdelete',
    'wimdir',
    'wimexport',
    'wimextract',
    'wiminfo',
    'wimjoin',
    'wimlib-imagex',
    'wimmount',
    'wimmountrw',
    'wimoptimize',
    'wimsplit',
    'wimunmount',
    'wimupdate',
    'wimverify',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^3.1.0',
    'gnome.org/libxml2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.4',
    '1.14.3',
    '1.14.1',
  ] as const,
  aliases: [] as const,
}

export type WimlibnetPackage = typeof wimlibnetPackage
