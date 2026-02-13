/**
 * **libsecret** - pkgx package
 *
 * @domain `gnome.org/libsecret`
 * @version `0.21.7` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/libsecret`
 * @dependencies `gnome.org/glib`, `gnupg.org/libgcrypt`, `gnupg.org/libgpg-error`
 * @buildDependencies `docbook.org/xsl`, `gnu.org/gettext`, `mesonbuild.com`, ... (+4 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorglibsecret
 * console.log(pkg.name)        // "libsecret"
 * console.log(pkg.versions[0]) // "0.21.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/libsecret.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorglibsecretPackage = {
  /**
   * The display name of this package.
   */
  name: 'libsecret' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/libsecret' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libsecret/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/libsecret' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/libsecret -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/libsecret' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib',
    'gnupg.org/libgcrypt',
    'gnupg.org/libgpg-error',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'docbook.org/xsl',
    'gnu.org/gettext',
    'mesonbuild.com',
    'gnome.org/vala',
    'gnome.org/libxslt',
    'freedesktop.org/dbus',
    'linux:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.21.7',
    '0.21.6',
    '0.21.5',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
  ] as const,
  aliases: [] as const,
}

export type GnomeorglibsecretPackage = typeof gnomeorglibsecretPackage
