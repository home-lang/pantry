/**
 * **metis** - Programs that partition graphs and order matrices
 *
 * @domain `glaros.dtc.umn.edu/metis`
 * @programs `cmpfillin`, `gpmetis`, `graphchk`, `m2gmetis`, `mpmetis`, ... (+1 more)
 * @version `5.2.1.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install glaros.dtc.umn.edu/metis`
 * @homepage http://glaros.dtc.umn.edu/gkhome/views/metis
 * @buildDependencies `gnu.org/make`, `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.glarosdtcumnedumetis
 * console.log(pkg.name)        // "metis"
 * console.log(pkg.description) // "Programs that partition graphs and order matrices"
 * console.log(pkg.programs)    // ["cmpfillin", "gpmetis", ...]
 * console.log(pkg.versions[0]) // "5.2.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/glaros-dtc-umn-edu/metis.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const glarosdtcumnedumetisPackage = {
  /**
  * The display name of this package.
  */
  name: 'metis' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'glaros.dtc.umn.edu/metis' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Programs that partition graphs and order matrices' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/glaros.dtc.umn.edu/metis/package.yml' as const,
  homepageUrl: 'http://glaros.dtc.umn.edu/gkhome/views/metis' as const,
  githubUrl: 'https://github.com/scivision/METIS' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install glaros.dtc.umn.edu/metis' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +glaros.dtc.umn.edu/metis -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install glaros.dtc.umn.edu/metis' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cmpfillin',
    'gpmetis',
    'graphchk',
    'm2gmetis',
    'mpmetis',
    'ndmetis',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.2.1.2',
    '5.2.1.1',
    '5.1.0.4',
    '5.1.0.3',
  ] as const,
  aliases: [] as const,
}

export type GlarosdtcumnedumetisPackage = typeof glarosdtcumnedumetisPackage
