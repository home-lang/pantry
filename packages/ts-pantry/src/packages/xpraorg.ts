/**
 * **xpra** - Persistent remote applications for X11; screen sharing for X11, MacOS and MSWindows.
 *
 * @domain `xpra.org`
 * @programs `xpra`
 * @version `6.4.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xpra.org`
 * @homepage https://xpra.org/
 * @dependencies `pkgx.sh^1`, `python.org~3.11`, `cython.org`, ... (+6 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xpraorg
 * console.log(pkg.name)        // "xpra"
 * console.log(pkg.description) // "Persistent remote applications for X11; screen ..."
 * console.log(pkg.programs)    // ["xpra"]
 * console.log(pkg.versions[0]) // "6.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xpra-org.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xpra.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xpra.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xpra.org' as const,
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
    'pkgx.sh^1',
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.4.1',
    '6.4.0',
    '6.3.6',
    '6.3.5',
    '6.3.4',
    '6.3.3',
    '6.3.2',
    '6.3.1',
    '6.3.0',
    '6.2.5',
    '6.2.4',
    '6.2.3',
    '6.2.2',
    '6.2.1',
    '6.2.0',
    '6.1.3',
    '6.1.2',
  ] as const,
  aliases: [] as const,
}

export type XpraorgPackage = typeof xpraorgPackage
