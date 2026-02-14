/**
 * **libyang** - YANG data modeling language library
 *
 * @domain `github.com/cesnet/libyang`
 * @programs `yanglint`, `yangre`
 * @version `4.2.2` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cesnet/libyang`
 * @dependencies `pcre.org/v2>=10.21`
 * @buildDependencies `graphviz.org`, `doxygen.nl`, `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcesnetlibyang
 * console.log(pkg.name)        // "libyang"
 * console.log(pkg.description) // "YANG data modeling language library"
 * console.log(pkg.programs)    // ["yanglint", "yangre"]
 * console.log(pkg.versions[0]) // "4.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cesnet/libyang.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libyangPackage = {
  /**
  * The display name of this package.
  */
  name: 'libyang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/cesnet/libyang' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'YANG data modeling language library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cesnet/libyang/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/CESNET/libyang' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/cesnet/libyang' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cesnet/libyang -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cesnet/libyang' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yanglint',
    'yangre',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pcre.org/v2>=10.21',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'graphviz.org',
    'doxygen.nl',
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.2.2',
    '3.13.6',
    '3.13.5',
    '3.12.2',
    '3.7.8',
    '3.4.2',
    '3.1.0',
    '2.1.148',
  ] as const,
  aliases: [] as const,
}

export type LibyangPackage = typeof libyangPackage
