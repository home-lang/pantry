/**
 * **libspatialite** - pkgx package
 *
 * @domain `gaia-gis.it/libspatialite`
 * @version `5.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gaia-gis.it/libspatialite`
 * @dependencies `gaia-gis.it/fossil/freexl`, `libgeos.org`, `git.osgeo.org/gitea/rttopo/librttopo`, ... (+4 more)
 * @buildDependencies `gnu.org/make`, `darwin:gnu.org/patch`, `darwin:curl.se` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gaiagisitlibspatialite
 * console.log(pkg.name)        // "libspatialite"
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gaia-gis-it/libspatialite.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gaiagisitlibspatialitePackage = {
  /**
  * The display name of this package.
  */
  name: 'libspatialite' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gaia-gis.it/libspatialite' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gaia-gis.it/libspatialite/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gaia-gis.it/libspatialite' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gaia-gis.it/libspatialite -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gaia-gis.it/libspatialite' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gaia-gis.it/fossil/freexl',
    'libgeos.org',
    'git.osgeo.org/gitea/rttopo/librttopo',
    'gnome.org/libxml2',
    'zlib.net/minizip',
    'proj.org',
    'sqlite.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'gnu.org/make',
    'darwin:gnu.org/patch',
    'darwin:curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.1.0',
    '5.0.1',
  ] as const,
  aliases: [] as const,
}

export type GaiagisitlibspatialitePackage = typeof gaiagisitlibspatialitePackage
