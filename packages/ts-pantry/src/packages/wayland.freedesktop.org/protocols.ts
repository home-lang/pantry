/**
 * **wayland-protocols** - pkgx package
 *
 * @domain `wayland.freedesktop.org/protocols`
 * @version `1.47.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wayland.freedesktop.org/protocols`
 * @buildDependencies `mesonbuild.com`, `python.org@~3.11`, `wayland.freedesktop.org`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.waylandfreedesktoporgprotocols
 * console.log(pkg.name)        // "wayland-protocols"
 * console.log(pkg.versions[0]) // "1.47.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wayland-freedesktop-org/protocols.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const waylandfreedesktoporgprotocolsPackage = {
  /**
  * The display name of this package.
  */
  name: 'wayland-protocols' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'wayland.freedesktop.org/protocols' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wayland.freedesktop.org/protocols/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install wayland.freedesktop.org/protocols' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wayland.freedesktop.org/protocols -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wayland.freedesktop.org/protocols' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@~3.11',
    'wayland.freedesktop.org',
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.47.0',
    '1.46.0',
    '1.45.0',
    '1.44.0',
    '1.43.0',
    '1.42.0',
    '1.41.0',
    '1.40.0',
    '1.39.0',
    '1.38.0',
    '1.37.0',
    '1.36.0',
    '1.35.0',
    '1.34.0',
    '1.33.0',
    '1.32.0',
  ] as const,
  aliases: [] as const,
}

export type WaylandfreedesktoporgprotocolsPackage = typeof waylandfreedesktoporgprotocolsPackage
