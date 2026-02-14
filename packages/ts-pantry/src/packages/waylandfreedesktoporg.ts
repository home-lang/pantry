/**
 * **wayland** - pkgx package
 *
 * @domain `wayland.freedesktop.org`
 * @programs `wayland-scanner`
 * @version `1.24.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wayland.freedesktop.org`
 * @dependencies `libexpat.github.io`, `sourceware.org/libffi`, `gnome.org/libxml2`
 * @buildDependencies `mesonbuild.com`, `gnu.org/make`, `cmake.org`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.waylandfreedesktoporg
 * console.log(pkg.name)        // "wayland"
 * console.log(pkg.programs)    // ["wayland-scanner"]
 * console.log(pkg.versions[0]) // "1.24.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wayland-freedesktop-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const waylandfreedesktoporgPackage = {
  /**
  * The display name of this package.
  */
  name: 'wayland' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wayland.freedesktop.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wayland.freedesktop.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wayland.freedesktop.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wayland.freedesktop.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wayland.freedesktop.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'wayland-scanner',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libexpat.github.io',
    'sourceware.org/libffi',
    'gnome.org/libxml2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'gnu.org/make',
    'cmake.org',
    'curl.se',
    'tukaani.org/xz',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.24.0',
    '1.23.93',
    '1.23.92',
    '1.23.91',
    '1.23.1',
    '1.23.0',
    '1.22.93',
    '1.22.92',
    '1.22.91',
    '1.22.0',
  ] as const,
  aliases: [] as const,
}

export type WaylandfreedesktoporgPackage = typeof waylandfreedesktoporgPackage
