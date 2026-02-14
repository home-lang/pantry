/**
 * **procps** - pkgx package
 *
 * @domain `gitlab.com/procps-ng/procps`
 * @programs `free`, `pgrep`, `pidof`, `pkill`, `pmap`, ... (+8 more)
 * @version `4.0.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitlab.com/procps-ng/procps`
 * @dependencies `invisible-island.net/ncurses>=6.0`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/gettext`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlabcomprocpsngprocps
 * console.log(pkg.name)        // "procps"
 * console.log(pkg.programs)    // ["free", "pgrep", ...]
 * console.log(pkg.versions[0]) // "4.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitlab-com/procps-ng/procps.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlabcomprocpsngprocpsPackage = {
  /**
  * The display name of this package.
  */
  name: 'procps' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gitlab.com/procps-ng/procps' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/procps-ng/procps/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gitlab.com/procps-ng/procps' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitlab.com/procps-ng/procps -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitlab.com/procps-ng/procps' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'free',
    'pgrep',
    'pidof',
    'pkill',
    'pmap',
    'ps',
    'pwdx',
    'slabtop',
    'sysctl',
    'tload',
    'top',
    'vmstat',
    'w',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses>=6.0',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/gettext',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.6',
    '4.0.5',
    '4.0.4',
  ] as const,
  aliases: [] as const,
}

export type GitlabcomprocpsngprocpsPackage = typeof gitlabcomprocpsngprocpsPackage
