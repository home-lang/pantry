/**
 * **openpmix.github** - Process Management Interface for HPC environments
 *
 * @domain `openpmix.github.io`
 * @programs `palloc`, `pattrs`, `pctrl`, `pevent`, `plookup`, ... (+4 more)
 * @version `6.1.0` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openpmix.github.io`
 * @homepage https://openpmix.github.io/
 * @dependencies `open-mpi.org/hwloc^2.10`, `libevent.org^2.1`, `zlib.net^1.3`
 * @buildDependencies `python.org@^3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openpmixgithubio
 * console.log(pkg.name)        // "openpmix.github"
 * console.log(pkg.description) // "Process Management Interface for HPC environments"
 * console.log(pkg.programs)    // ["palloc", "pattrs", ...]
 * console.log(pkg.versions[0]) // "6.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openpmix-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openpmixgithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'openpmix.github' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'openpmix.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Process Management Interface for HPC environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openpmix.github.io/package.yml' as const,
  homepageUrl: 'https://openpmix.github.io/' as const,
  githubUrl: 'https://github.com/openpmix/openpmix' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install openpmix.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openpmix.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openpmix.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'palloc',
    'pattrs',
    'pctrl',
    'pevent',
    'plookup',
    'pmix_info',
    'pmixcc',
    'pps',
    'pquery',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'open-mpi.org/hwloc^2.10',
    'libevent.org^2.1',
    'zlib.net^1.3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@^3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.1.0',
    '6.0.0',
    '5.0.10',
    '5.0.9',
    '5.0.8',
    '5.0.7',
    '5.0.6',
    '5.0.5',
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
  ] as const,
  aliases: [] as const,
}

export type OpenpmixgithubioPackage = typeof openpmixgithubioPackage
