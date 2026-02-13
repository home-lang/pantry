/**
 * **jira** - simple jira command line client in Go
 *
 * @domain `github.com/ankitpokhrel/jira-cli`
 * @programs `jira`
 * @version `1.7.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ankitpokhrel/jira-cli`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomankitpokhreljiracli
 * console.log(pkg.name)        // "jira"
 * console.log(pkg.description) // "simple jira command line client in Go"
 * console.log(pkg.programs)    // ["jira"]
 * console.log(pkg.versions[0]) // "1.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ankitpokhrel/jira-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jiracliPackage = {
  /**
   * The display name of this package.
   */
  name: 'jira' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ankitpokhrel/jira-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'simple jira command line client in Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ankitpokhrel/jira-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/go-jira/jira' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ankitpokhrel/jira-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ankitpokhrel/jira-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ankitpokhrel/jira-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jira',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.7.0',
    '1.6.0',
    '1.5.2',
    '1.5.1',
  ] as const,
  aliases: [] as const,
}

export type JiracliPackage = typeof jiracliPackage
