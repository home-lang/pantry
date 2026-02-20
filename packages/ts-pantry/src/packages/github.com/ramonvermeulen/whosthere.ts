/**
 * **whosthere** - pkgx package
 *
 * @domain `github.com/ramonvermeulen/whosthere`
 * @version `0.6.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ramonvermeulen/whosthere`
 * @buildDependencies `go.dev@^1.25.6` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomramonvermeulenwhosthere
 * console.log(pkg.name)        // "whosthere"
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ramonvermeulen/whosthere.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const whostherePackage = {
  /**
  * The display name of this package.
  */
  name: 'whosthere' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/ramonvermeulen/whosthere' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ramonvermeulen/whosthere/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/ramonvermeulen/whosthere' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ramonvermeulen/whosthere -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ramonvermeulen/whosthere' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.25.6',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.1',
  ] as const,
  aliases: [] as const,
}

export type WhostherePackage = typeof whostherePackage
