/**
 * **qhull** - Qhull development for www.qhull.org -- Qhull 2020.2 (8.1-alpha1) at https://github.com/qhull/qhull/wiki
 *
 * @domain `qhull.org`
 * @programs `qconvex`, `qdelaunay`, `qhalf`, `qhull`, `qvoronoi`, ... (+1 more)
 * @version `8.0.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install qhull.org`
 * @homepage http://www.qhull.org/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.qhullorg
 * console.log(pkg.name)        // "qhull"
 * console.log(pkg.description) // "Qhull development for www.qhull.org -- Qhull 20..."
 * console.log(pkg.programs)    // ["qconvex", "qdelaunay", ...]
 * console.log(pkg.versions[0]) // "8.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/qhull-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const qhullorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'qhull' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'qhull.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Qhull development for www.qhull.org -- Qhull 2020.2 (8.1-alpha1) at https://github.com/qhull/qhull/wiki' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/qhull.org/package.yml' as const,
  homepageUrl: 'http://www.qhull.org/' as const,
  githubUrl: 'https://github.com/qhull/qhull' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install qhull.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +qhull.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install qhull.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'qconvex',
    'qdelaunay',
    'qhalf',
    'qhull',
    'qvoronoi',
    'rbox',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.0.2',
  ] as const,
  aliases: [] as const,
}

export type QhullorgPackage = typeof qhullorgPackage
