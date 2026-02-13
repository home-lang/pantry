/**
 * **gtk3** - Toolkit for creating graphical user interfaces
 *
 * @domain `gtk.org/gtk3`
 * @programs `gtk-builder-tool`, `gtk-encode-symbolic-svg`, `gtk-launch`, `gtk-query-immodules-3.0`, `gtk-query-settings`, ... (+5 more)
 * @version `3.24.38` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gtk.org/gtk3`
 * @homepage https://gtk.org/
 * @dependencies `gnome.org/atk`, `gnome.org/gdk-pixbuf`, `gnome.org/glib`, ... (+18 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `docbook.org`, `docbook.org/xsl`, `gnu.org/gettext`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gtkorggtk3
 * console.log(pkg.name)        // "gtk3"
 * console.log(pkg.description) // "Toolkit for creating graphical user interfaces"
 * console.log(pkg.programs)    // ["gtk-builder-tool", "gtk-encode-symbolic-svg", ...]
 * console.log(pkg.versions[0]) // "3.24.38" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gtk-org/gtk3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gtkorggtk3Package = {
  /**
   * The display name of this package.
   */
  name: 'gtk3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gtk.org/gtk3' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Toolkit for creating graphical user interfaces' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk3/package.yml' as const,
  homepageUrl: 'https://gtk.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gtk.org/gtk3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gtk.org/gtk3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gtk.org/gtk3' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gtk-builder-tool',
    'gtk-encode-symbolic-svg',
    'gtk-launch',
    'gtk-query-immodules-3.0',
    'gtk-query-settings',
    'gtk-update-icon-cache',
    'gtk3-demo',
    'gtk3-demo-application',
    'gtk3-icon-browser',
    'gtk3-widget-factory',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'gnome.org/atk',
    'gnome.org/gdk-pixbuf',
    'gnome.org/glib',
    'gnome.org/gsettings-desktop-schemas',
    'freedesktop.org/icon-theme',
    'github.com/anholt/libepoxy',
    'gnome.org/pango',
    'gnome.org/libxslt',
    'x.org/x11',
    'x.org/exts',
    'x.org/xrender',
    'x.org/xrandr',
    'x.org/xi',
    'ebassi.github.io/graphene',
    'xkbcommon.org',
    'debian.org/iso-codes',
    'freedesktop.org/at-spi2-atk',
    'linux:cairographics.org',
    'linux:wayland.freedesktop.org/protocols',
    'linux:x.org/protocol',
    'linux:openprinting.github.io/cups',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'docbook.org',
    'docbook.org/xsl',
    'gnu.org/gettext',
    'mesonbuild.com',
    'linux:cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.24.38',
  ] as const,
  aliases: [] as const,
}

export type Gtkorggtk3Package = typeof gtkorggtk3Package
