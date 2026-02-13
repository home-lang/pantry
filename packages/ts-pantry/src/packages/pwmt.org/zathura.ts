/**
 * **zathura** - Document viewer
 *
 * @domain `pwmt.org/zathura`
 * @programs `zathura`
 * @version `0.5.14` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pwmt.org/zathura`
 * @homepage https://pwmt.org/projects/zathura
 * @dependencies `gnome.org/glib^2.72`, `gnome.org/adwaita-icon-theme`, `gnu.org/gettext`, ... (+8 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com@>=0.61`, `linux:nixos.org/patchelf` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pwmtorgzathura
 * console.log(pkg.name)        // "zathura"
 * console.log(pkg.description) // "Document viewer"
 * console.log(pkg.programs)    // ["zathura"]
 * console.log(pkg.versions[0]) // "0.5.14" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pwmt-org/zathura.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pwmtorgzathuraPackage = {
  /**
   * The display name of this package.
   */
  name: 'zathura' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pwmt.org/zathura' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Document viewer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pwmt.org/zathura/package.yml' as const,
  homepageUrl: 'https://pwmt.org/projects/zathura' as const,
  githubUrl: 'https://github.com/pwmt/zathura' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pwmt.org/zathura' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pwmt.org/zathura -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pwmt.org/zathura' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zathura',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'gnome.org/glib^2.72',
    'gnome.org/adwaita-icon-theme',
    'gnu.org/gettext',
    'freedesktop.org/appstream',
    'pwmt.org/girara@0',
    'freedesktop.org/intltool',
    'freedesktop.org/desktop-file-utils',
    'darwinsys.com/file',
    'gtk.org/gtk3^3.22',
    'sqlite.org@3',
    'darwin:gnome.org/gtk-mac-integration-gtk3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'mesonbuild.com@>=0.61',
    'linux:nixos.org/patchelf',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.14',
    '0.5.13',
    '0.5.12',
    '0.5.11',
    '0.5.10',
    '0.5.9',
    '0.5.8',
    '0.5.7',
    '0.5.6',
  ] as const,
  aliases: [] as const,
}

export type PwmtorgzathuraPackage = typeof pwmtorgzathuraPackage
