/**
 * **xdg-user-dir** - pkgx package
 *
 * @domain `freedesktop.org/xdg-user-dirs`
 * @programs `xdg-user-dir`, `xdg-user-dirs-update`
 * @version `0.19.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/xdg-user-dirs`
 * @dependencies `gnu.org/gettext^0.21`, `gnu.org/libiconv^1.1`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgxdguserdirs
 * console.log(pkg.name)        // "xdg-user-dir"
 * console.log(pkg.programs)    // ["xdg-user-dir", "xdg-user-dirs-update"]
 * console.log(pkg.versions[0]) // "0.19.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/xdg-user-dirs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgxdguserdirsPackage = {
  /**
   * The display name of this package.
   */
  name: 'xdg-user-dir' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/xdg-user-dirs' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xdg-user-dirs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/xdg-user-dirs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/xdg-user-dirs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/xdg-user-dirs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xdg-user-dir',
    'xdg-user-dirs-update',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext^0.21',
    'gnu.org/libiconv^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.19.0',
    '0.18.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgxdguserdirsPackage = typeof freedesktoporgxdguserdirsPackage
