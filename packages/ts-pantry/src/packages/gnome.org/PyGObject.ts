/**
 * **PyGObject** - pkgx package
 *
 * @domain `gnome.org/PyGObject`
 * @version `3.51.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/PyGObject`
 * @dependencies `gnome.org/gobject-introspection`, `cairographics.org/pycairo`
 * @buildDependencies `mesonbuild.com`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorgpygobject
 * console.log(pkg.name)        // "PyGObject"
 * console.log(pkg.versions[0]) // "3.51.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/PyGObject.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorgpygobjectPackage = {
  /**
   * The display name of this package.
   */
  name: 'PyGObject' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/PyGObject' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/PyGObject/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/PyGObject' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/PyGObject -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/PyGObject' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/gobject-introspection',
    'cairographics.org/pycairo',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.51.0',
    '3.50.0',
    '3.49.0',
    '3.48.2',
    '3.48.1',
    '3.48.0',
    '3.47.0',
    '3.46.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorgpygobjectPackage = typeof gnomeorgpygobjectPackage
