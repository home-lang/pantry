/**
 * **gtk4** - Toolkit for creating graphical user interfaces
 *
 * @domain `gtk.org/gtk4`
 * @programs `gtk4-builder-tool`, `gtk4-demo`, `gtk4-demo-application`, `gtk4-encode-symbolic-svg`, `gtk4-launch`, ... (+6 more)
 * @version `4.21.4` (57 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gtk.org/gtk4`
 * @homepage https://gtk.org/
 * @dependencies `gnome.org/gdk-pixbuf^2.42`, `gnome.org/glib^2.78`, `gnome.org/librsvg^2.60 # since 4.19.2`, ... (+16 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `docbook.org`, `docbook.org/xsl`, `gnu.org/gettext`, ... (+5 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gtkorggtk4
 * console.log(pkg.name)        // "gtk4"
 * console.log(pkg.description) // "Toolkit for creating graphical user interfaces"
 * console.log(pkg.programs)    // ["gtk4-builder-tool", "gtk4-demo", ...]
 * console.log(pkg.versions[0]) // "4.21.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gtk-org/gtk4.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gtkorggtk4Package = {
  /**
   * The display name of this package.
   */
  name: 'gtk4' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gtk.org/gtk4' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Toolkit for creating graphical user interfaces' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gtk.org/gtk4/package.yml' as const,
  homepageUrl: 'https://gtk.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gtk.org/gtk4' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gtk.org/gtk4 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gtk.org/gtk4' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gtk4-builder-tool',
    'gtk4-demo',
    'gtk4-demo-application',
    'gtk4-encode-symbolic-svg',
    'gtk4-launch',
    'gtk4-node-editor',
    'gtk4-query-settings',
    'gtk4-print-editor',
    'gtk4-rendernode-tool',
    'gtk4-update-icon-cache',
    'gtk4-widget-factory',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'gnome.org/gdk-pixbuf^2.42',
    'gnome.org/glib^2.78',
    'gnome.org/librsvg^2.60 # since 4.19.2',
    'ebassi.github.io/graphene^1.10',
    'freedesktop.org/icon-theme^0.17',
    'libjpeg-turbo.org^2',
    'github.com/anholt/libepoxy^1.5.10',
    'libpng.org^1.6',
    'simplesystems.org/libtiff^4.6',
    'gnome.org/pango^1.50',
    'openprinting.github.io/cups^2.4',
    'github.com/KhronosGroup/Vulkan-Loader^1',
    'github.com/google/shaderc^2023',
    'linux:x.org/xi^1.8',
    'linux:x.org/xinerama^1.1',
    'linux:x.org/xcursor^1.2',
    'linux:xkbcommon.org^1.6',
    'linux:cairographics.org^1.18',
    'linux:wayland.freedesktop.org/protocols^1.43 # since 4.19.1',
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
    'gnome.org/libxslt',
    'gnome.org/libxml2@~2.13',
    'cmake.org',
    'linux:gnu.org/binutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.21.4',
    '4.21.3',
    '4.21.2',
    '4.21.1',
    '4.21.0',
    '4.20.3',
    '4.20.2',
    '4.20.1',
    '4.20.0',
    '4.19.4',
    '4.19.3',
    '4.19.2',
    '4.19.1',
    '4.19.0',
    '4.18.6',
    '4.18.5',
    '4.18.4',
    '4.18.3',
    '4.18.2',
    '4.18.1',
    '4.17.6',
    '4.17.5',
    '4.17.4',
    '4.17.3',
    '4.17.2',
    '4.17.1',
    '4.17.0',
    '4.16.13',
    '4.16.12',
    '4.16.7',
    '4.16.6',
    '4.16.5',
    '4.16.4',
    '4.16.3',
    '4.16.2',
    '4.16.1',
    '4.16.0',
    '4.15.6',
    '4.15.5',
    '4.15.4',
    '4.15.3',
    '4.15.2',
    '4.15.1',
    '4.15.0',
    '4.14.5',
    '4.14.4',
    '4.14.3',
    '4.14.2',
    '4.14.1',
    '4.14.0',
    '4.13.9',
    '4.13.8',
    '4.13.7',
    '4.13.6',
    '4.13.5',
    '4.13.4',
    '4.13.3',
  ] as const,
  aliases: [] as const,
}

export type Gtkorggtk4Package = typeof gtkorggtk4Package
