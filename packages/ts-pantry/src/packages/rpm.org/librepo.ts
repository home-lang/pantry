/**
 * **librepo** - pkgx package
 *
 * @domain `rpm.org/librepo`
 * @version `1.20.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rpm.org/librepo`
 * @dependencies `gnome.org/glib`, `gnome.org/libxml2`, `savannah.nongnu.org/attr`, ... (+7 more)
 * @buildDependencies `cmake.org@>=3.16`, `gnu.org/gcc@^14`, `python.org@>=3.9` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rpmorglibrepo
 * console.log(pkg.name)        // "librepo"
 * console.log(pkg.versions[0]) // "1.20.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rpm-org/librepo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rpmorglibrepoPackage = {
  /**
  * The display name of this package.
  */
  name: 'librepo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rpm.org/librepo' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rpm.org/librepo/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rpm.org/librepo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rpm.org/librepo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rpm.org/librepo' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib',
    'gnome.org/libxml2',
    'savannah.nongnu.org/attr',
    'curl.se',
    'openssl.org',
    'rpm.org/rpm',
    'rpm.org/popt',
    'zlib.net',
    'pcre.org/v2',
    'sourceware.org/libffi',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@>=3.16',
    'gnu.org/gcc@^14',
    'python.org@>=3.9',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.20.0',
  ] as const,
  aliases: [] as const,
}

export type RpmorglibrepoPackage = typeof rpmorglibrepoPackage
