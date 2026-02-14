/**
 * **fontconfig** - XML-based font configuration API for X Windows
 *
 * @domain `freedesktop.org/fontconfig`
 * @programs `fc-cache`, `fc-cat`, `fc-conflist`, `fc-list`, `fc-match`, ... (+4 more)
 * @version `2.17.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/fontconfig`
 * @homepage https://wiki.freedesktop.org/www/Software/fontconfig/
 * @dependencies `sourceware.org/bzip2@1`, `freetype.org@2`, `zlib.net@1`, ... (+2 more)
 * @buildDependencies `gnu.org/gperf@3`, `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgfontconfig
 * console.log(pkg.name)        // "fontconfig"
 * console.log(pkg.description) // "XML-based font configuration API for X Windows"
 * console.log(pkg.programs)    // ["fc-cache", "fc-cat", ...]
 * console.log(pkg.versions[0]) // "2.17.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/fontconfig.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgfontconfigPackage = {
  /**
  * The display name of this package.
  */
  name: 'fontconfig' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/fontconfig' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'XML-based font configuration API for X Windows' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/fontconfig/package.yml' as const,
  homepageUrl: 'https://wiki.freedesktop.org/www/Software/fontconfig/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/fontconfig' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/fontconfig -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/fontconfig' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'fc-cache',
    'fc-cat',
    'fc-conflist',
    'fc-list',
    'fc-match',
    'fc-pattern',
    'fc-query',
    'fc-scan',
    'fc-validate',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'sourceware.org/bzip2@1',
    'freetype.org@2',
    'zlib.net@1',
    'gnome.org/libxml2@2',
    'libexpat.github.io@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gperf@3',
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.17.1',
    '2.17.0',
    '2.16.2',
    '2.16.0',
    '2.15.0',
    '2.14.1',
    '2.14.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgfontconfigPackage = typeof freedesktoporgfontconfigPackage
