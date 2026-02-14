/**
 * **stargazers** - Analyze GitHub stars
 *
 * @domain `github.com/spencerkimball/stargazers`
 * @programs `stargazers`
 * @version `0.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/spencerkimball/stargazers`
 * @buildDependencies `go.dev@^1.16.15` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomspencerkimballstargazers
 * console.log(pkg.name)        // "stargazers"
 * console.log(pkg.description) // "Analyze GitHub stars"
 * console.log(pkg.programs)    // ["stargazers"]
 * console.log(pkg.versions[0]) // "0.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/spencerkimball/stargazers.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const stargazersPackage = {
  /**
  * The display name of this package.
  */
  name: 'stargazers' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/spencerkimball/stargazers' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Analyze GitHub stars' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/spencerkimball/stargazers/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/spencerkimball/stargazers' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/spencerkimball/stargazers' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/spencerkimball/stargazers -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/spencerkimball/stargazers' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'stargazers',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.16.15',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type StargazersPackage = typeof stargazersPackage
