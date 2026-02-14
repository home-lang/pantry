/**
 * **plotutils** - C/C++ function library for exporting 2-D vector graphics
 *
 * @domain `gnu.org/plotutils`
 * @programs `double`, `graph`, `ode`, `pic2plot`, `plot`, ... (+3 more)
 * @version `2.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/plotutils`
 * @homepage https://www.gnu.org/software/plotutils/
 * @dependencies `libpng.org^1.6`, `libraw.org^0.21`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgplotutils
 * console.log(pkg.name)        // "plotutils"
 * console.log(pkg.description) // "C/C++ function library for exporting 2-D vector..."
 * console.log(pkg.programs)    // ["double", "graph", ...]
 * console.log(pkg.versions[0]) // "2.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/plotutils.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgplotutilsPackage = {
  /**
  * The display name of this package.
  */
  name: 'plotutils' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/plotutils' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C/C++ function library for exporting 2-D vector graphics' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/plotutils/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/plotutils/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/plotutils' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/plotutils -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/plotutils' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'double',
    'graph',
    'ode',
    'pic2plot',
    'plot',
    'plotfont',
    'spline',
    'tek2plot',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libpng.org^1.6',
    'libraw.org^0.21',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.6.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgplotutilsPackage = typeof gnuorgplotutilsPackage
