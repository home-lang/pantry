/**
 * **glib-networking** - pkgx package
 *
 * @domain `gnome.org/glib-networking`
 * @version `2.80.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/glib-networking`
 * @dependencies `gnome.org/glib`, `gnutls.org`, `gnome.org/gsettings-desktop-schemas`
 * @buildDependencies `mesonbuild.com`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorgglibnetworking
 * console.log(pkg.name)        // "glib-networking"
 * console.log(pkg.versions[0]) // "2.80.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/glib-networking.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorgglibnetworkingPackage = {
  /**
  * The display name of this package.
  */
  name: 'glib-networking' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/glib-networking' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/glib-networking/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/glib-networking' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/glib-networking -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/glib-networking' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib',
    'gnutls.org',
    'gnome.org/gsettings-desktop-schemas',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'mesonbuild.com',
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.80.1',
    '2.80.0',
    '2.78.1',
    '2.78.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorgglibnetworkingPackage = typeof gnomeorgglibnetworkingPackage
