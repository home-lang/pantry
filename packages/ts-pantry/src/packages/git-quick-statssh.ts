/**
 * **git-quick-stats** - ▁▅▆▃▅ Git quick statistics is a simple and efficient way to access various statistics in git repository.
 *
 * @domain `git-quick-stats.sh`
 * @programs `git-quick-stats`
 * @version `2.8.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install git-quick-stats.sh`
 * @homepage https://git-quick-stats.sh/
 * @dependencies `git-scm.org`, `gnu.org/bash`, `linux:github.com/util-linux/util-linux` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitquickstatssh
 * console.log(pkg.name)        // "git-quick-stats"
 * console.log(pkg.description) // "▁▅▆▃▅ Git quick statistics is a simple and effi..."
 * console.log(pkg.programs)    // ["git-quick-stats"]
 * console.log(pkg.versions[0]) // "2.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/git-quick-stats-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitquickstatsshPackage = {
  /**
  * The display name of this package.
  */
  name: 'git-quick-stats' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'git-quick-stats.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: '▁▅▆▃▅ Git quick statistics is a simple and efficient way to access various statistics in git repository.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/git-quick-stats.sh/package.yml' as const,
  homepageUrl: 'https://git-quick-stats.sh/' as const,
  githubUrl: 'https://github.com/arzzen/git-quick-stats' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install git-quick-stats.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +git-quick-stats.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git-quick-stats.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git-quick-stats',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'git-scm.org',
    'gnu.org/bash',
    'linux:github.com/util-linux/util-linux',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.8.0',
    '2.7.0',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.8',
    '2.5.7',
    '2.5.6',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.1',
  ] as const,
  aliases: [] as const,
}

export type GitquickstatsshPackage = typeof gitquickstatsshPackage
