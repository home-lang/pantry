/**
 * **gnuplot** - Command-driven, interactive function plotting
 *
 * @domain `gnuplot.info`
 * @programs `gnuplot`
 * @version `6.0.4` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnuplot.info`
 * @homepage http://www.gnuplot.info/
 * @dependencies `libgd.github.io`, `lua.org`, `gnome.org/pango`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuplotinfo
 * console.log(pkg.name)        // "gnuplot"
 * console.log(pkg.description) // "Command-driven, interactive function plotting"
 * console.log(pkg.programs)    // ["gnuplot"]
 * console.log(pkg.versions[0]) // "6.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnuplot-info.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuplotinfoPackage = {
  /**
   * The display name of this package.
   */
  name: 'gnuplot' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnuplot.info' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-driven, interactive function plotting' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnuplot.info/package.yml' as const,
  homepageUrl: 'http://www.gnuplot.info/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnuplot.info' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnuplot.info -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnuplot.info' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gnuplot',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'libgd.github.io',
    'lua.org',
    'gnome.org/pango',
    'gnu.org/readline',
    'linux:github.com/AOMediaCodec/libavif^0.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.0.4',
    '6.0.3',
    '6.0.2',
    '6.0.1',
    '6.0.0',
    '5.4.10',
    '5.4.9',
    '5.4.8',
    '5.4.7',
    '5.4.6',
  ] as const,
  aliases: [] as const,
}

export type GnuplotinfoPackage = typeof gnuplotinfoPackage
