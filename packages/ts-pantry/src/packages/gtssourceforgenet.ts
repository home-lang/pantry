/**
 * **gts.sourceforge** - GNU triangulated surface library
 *
 * @domain `gts.sourceforge.net`
 * @programs `delaunay`, `gts2dxf`, `gts2oogl`, `gts2stl`, `gtscheck`, ... (+4 more)
 * @version `0.7.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gts.sourceforge.net`
 * @homepage https://gts.sourceforge.net/
 * @dependencies `gnome.org/glib>=2.4.0`
 * @buildDependencies `gnu.org/automake`, `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gtssourceforgenet
 * console.log(pkg.name)        // "gts.sourceforge"
 * console.log(pkg.description) // "GNU triangulated surface library"
 * console.log(pkg.programs)    // ["delaunay", "gts2dxf", ...]
 * console.log(pkg.versions[0]) // "0.7.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gts-sourceforge-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gtssourceforgenetPackage = {
  /**
   * The display name of this package.
   */
  name: 'gts.sourceforge' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gts.sourceforge.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GNU triangulated surface library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gts.sourceforge.net/package.yml' as const,
  homepageUrl: 'https://gts.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gts.sourceforge.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gts.sourceforge.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gts.sourceforge.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'delaunay',
    'gts2dxf',
    'gts2oogl',
    'gts2stl',
    'gtscheck',
    'gtscompare',
    'gtstemplate',
    'stl2gts',
    'transform',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib>=2.4.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/automake',
    'gnu.org/autoconf',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.6',
  ] as const,
  aliases: [] as const,
}

export type GtssourceforgenetPackage = typeof gtssourceforgenetPackage
