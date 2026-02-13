/**
 * **g-ir** - Generate introspection data for GObject libraries
 *
 * @domain `gnome.org/gobject-introspection`
 * @programs `g-ir-annotation-tool`, `g-ir-compiler`, `g-ir-generate`, `g-ir-inspect`, `g-ir-scanner`
 * @version `1.86.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/gobject-introspection`
 * @homepage https://gi.readthedocs.io/en/latest/
 * @dependencies `gnome.org/glib@2`, `sourceware.org/libffi@3`, `gnu.org/bison^3 #NOTE macOS provides v2`, ... (+2 more)
 * @buildDependencies `mesonbuild.com@^1.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorggobjectintrospection
 * console.log(pkg.name)        // "g-ir"
 * console.log(pkg.description) // "Generate introspection data for GObject libraries"
 * console.log(pkg.programs)    // ["g-ir-annotation-tool", "g-ir-compiler", ...]
 * console.log(pkg.versions[0]) // "1.86.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/gobject-introspection.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorggobjectintrospectionPackage = {
  /**
   * The display name of this package.
   */
  name: 'g-ir' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/gobject-introspection' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate introspection data for GObject libraries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gobject-introspection/package.yml' as const,
  homepageUrl: 'https://gi.readthedocs.io/en/latest/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/gobject-introspection' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/gobject-introspection -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/gobject-introspection' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'g-ir-annotation-tool',
    'g-ir-compiler',
    'g-ir-generate',
    'g-ir-inspect',
    'g-ir-scanner',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib@2',
    'sourceware.org/libffi@3',
    'gnu.org/bison^3 #NOTE macOS provides v2',
    'python.org>=3<3.12',
    'github.com/westes/flex@2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@^1.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.86.0',
    '1.84.0',
    '1.83.4',
    '1.83.2',
    '1.82.0',
    '1.72.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorggobjectintrospectionPackage = typeof gnomeorggobjectintrospectionPackage
