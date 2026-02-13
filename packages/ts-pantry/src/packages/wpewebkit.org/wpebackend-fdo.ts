/**
 * **wpebackend-fdo** - pkgx package
 *
 * @domain `wpewebkit.org/wpebackend-fdo`
 * @version `1.16.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wpewebkit.org/wpebackend-fdo`
 * @dependencies `gnome.org/glib`, `github.com/anholt/libepoxy`, `wpewebkit.org/libwpe`, ... (+2 more)
 * @buildDependencies `gnu.org/gcc`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wpewebkitorgwpebackendfdo
 * console.log(pkg.name)        // "wpebackend-fdo"
 * console.log(pkg.versions[0]) // "1.16.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wpewebkit-org/wpebackend-fdo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wpewebkitorgwpebackendfdoPackage = {
  /**
   * The display name of this package.
   */
  name: 'wpebackend-fdo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'wpewebkit.org/wpebackend-fdo' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wpewebkit.org/wpebackend-fdo/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Igalia/WPEBackend-fdo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install wpewebkit.org/wpebackend-fdo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wpewebkit.org/wpebackend-fdo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wpewebkit.org/wpebackend-fdo' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib',
    'github.com/anholt/libepoxy',
    'wpewebkit.org/libwpe',
    'mesa3d.org',
    'wayland.freedesktop.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/gcc',
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.16.1',
    '1.16.0',
    '1.14.4',
    '1.14.3',
    '1.14.2',
  ] as const,
  aliases: [] as const,
}

export type WpewebkitorgwpebackendfdoPackage = typeof wpewebkitorgwpebackendfdoPackage
