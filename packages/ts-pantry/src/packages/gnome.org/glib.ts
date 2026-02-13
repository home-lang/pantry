/**
 * **glib** - Core application library for C
 *
 * @domain `gnome.org/glib`
 * @programs `gdbus`, `gdbus-codegen`, `gio`, `gio-querymodules`, `glib-compile-resources`, ... (+9 more)
 * @version `2.87.2` (56 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/glib`
 * @homepage https://docs.gtk.org/glib/
 * @dependencies `gnu.org/gettext^0.21`, `sourceware.org/libffi@3`, `pcre.org@8`, ... (+2 more)
 * @buildDependencies `mesonbuild.com@^1.2`, `python.org@>=3.5<3.12`, `gnome.org/libxml2@~2.13` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorgglib
 * console.log(pkg.name)        // "glib"
 * console.log(pkg.description) // "Core application library for C"
 * console.log(pkg.programs)    // ["gdbus", "gdbus-codegen", ...]
 * console.log(pkg.versions[0]) // "2.87.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/glib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorgglibPackage = {
  /**
   * The display name of this package.
   */
  name: 'glib' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/glib' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Core application library for C' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/glib/package.yml' as const,
  homepageUrl: 'https://docs.gtk.org/glib/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/glib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/glib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/glib' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gdbus',
    'gdbus-codegen',
    'gio',
    'gio-querymodules',
    'glib-compile-resources',
    'glib-compile-schemas',
    'glib-genmarshal',
    'glib-gettextize',
    'glib-mkenums',
    'gobject-query',
    'gresource',
    'gsettings',
    'gtester',
    'gtester-report',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext^0.21',
    'sourceware.org/libffi@3',
    'pcre.org@8',
    'pcre.org/v2@10',
    'python.org^3 # several of the bins are scripts',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@^1.2',
    'python.org@>=3.5<3.12',
    'gnome.org/libxml2@~2.13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.87.2',
    '2.87.1',
    '2.87.0',
    '2.86.3',
    '2.86.2',
    '2.86.1',
    '2.86.0',
    '2.85.4',
    '2.85.3',
    '2.85.2',
    '2.85.1',
    '2.85.0',
    '2.84.4',
    '2.84.3',
    '2.84.2',
    '2.84.1',
    '2.84.0',
    '2.83.5',
    '2.83.4',
    '2.83.3',
    '2.83.2',
    '2.83.0',
    '2.82.5',
    '2.82.4',
    '2.82.3',
    '2.82.2',
    '2.82.1',
    '2.82.0',
    '2.81.2',
    '2.81.0',
    '2.80.5',
    '2.80.4',
    '2.80.3',
    '2.80.2',
    '2.80.1',
    '2.80.0',
    '2.79.3',
    '2.79.2',
    '2.79.1',
    '2.79.0',
    '2.78.6',
    '2.78.5',
    '2.78.3',
    '2.78.2',
    '2.78.1',
    '2.78.0',
    '2.77.3',
    '2.77.2',
    '2.77.1',
    '2.77.0',
    '2.76.6',
    '2.76.5',
    '2.76.4',
    '2.76.3',
    '2.76.2',
    '2.72.4',
  ] as const,
  aliases: [] as const,
}

export type GnomeorgglibPackage = typeof gnomeorgglibPackage
