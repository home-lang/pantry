/**
 * **xpra** - Persistent remote applications for X11; screen sharing for X11, MacOS and MSWindows.
 *
 * @domain `xpra.org`
 * @programs `xpra`
 * @version `6.5.5` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install xpra.org`
 * @homepage https://xpra.org/
 * @dependencies `pkgx.sh>=1`, `python.org~3.11`, `cython.org`, ... (+6 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xpraorg
 * console.log(pkg.name)        // "xpra"
 * console.log(pkg.description) // "Persistent remote applications for X11; screen ..."
 * console.log(pkg.programs)    // ["xpra"]
 * console.log(pkg.versions[0]) // "6.5.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/xpra-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const xpraorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'xpra' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xpra.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Persistent remote applications for X11; screen sharing for X11, MacOS and MSWindows.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xpra.org/package.yml' as const,
  homepageUrl: 'https://xpra.org/' as const,
  githubUrl: 'https://github.com/Xpra-org/xpra' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install xpra.org' as const,
  pantryInstallCommand: 'pantry install xpra.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xpra',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
    'python.org~3.11',
    'cython.org',
    'tukaani.org/xz',
    'cairographics.org',
    'cairographics.org/pycairo@1.26.1',
    'freedesktop.org/pkg-config~0.29',
    'gnome.org/PyGObject',
    'gnome.org/glib',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '6.5.5',
    '6.5.4',
    '6.5.3',
    '6.5.2',
    '6.5.1',
    '6.5',
    '6.4.4',
    '6.4.3',
    '6.4.2',
    '6.4.1',
    '6.4',
    '6.4.0',
    '6.3.6',
    '6.3.5',
    '6.3.4',
    '6.3.3',
    '6.3.2',
    '6.3.1',
    '6.3',
    '6.3.0',
    '6.2.5',
    '6.2.4',
    '6.2.3',
    '6.2.2',
    '6.2.1',
    '6.2',
    '6.2.0',
    '6.1.3',
    '6.1.2',
    '6.1.1',
    '6.1.0',
    '6.0.2',
    '6.0.1',
    '6.0',
    '5.1.6',
    '5.1.5',
    '5.1.4',
    '5.1.3',
    '5.1.2',
    '5.1.1',
    '5.1',
    '5.0.12',
    '5.0.11',
    '5.0.10',
    '5.0.9',
    '5.0.8',
    '5.0.7',
    '5.0.6',
    '5.0.5',
    '5.0.4',
    '5.0.3',
    '3.1.9',
    '3.1.8',
    '3.1.7',
    '3.1.6',
  ] as const,
  aliases: [] as const,
}

export type XpraorgPackage = typeof xpraorgPackage
