/**
 * **watch** - pkgx package
 *
 * @domain `gitlab.com/procps-ng/watch`
 * @programs `watch`
 * @version `4.0.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitlab.com/procps-ng/watch`
 * @dependencies `invisible-island.net/ncurses>=6.0`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/gettext`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlabcomprocpsngwatch
 * console.log(pkg.name)        // "watch"
 * console.log(pkg.programs)    // ["watch"]
 * console.log(pkg.versions[0]) // "4.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitlab-com/procps-ng/watch.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlabcomprocpsngwatchPackage = {
  /**
  * The display name of this package.
  */
  name: 'watch' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gitlab.com/procps-ng/watch' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/procps-ng/watch/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gitlab.com/procps-ng/watch' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitlab.com/procps-ng/watch -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitlab.com/procps-ng/watch' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'watch',
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
    'gnu.org/m4',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.6',
    '4.0.4',
    '4.0.3',
  ] as const,
  aliases: [] as const,
}

export type GitlabcomprocpsngwatchPackage = typeof gitlabcomprocpsngwatchPackage
