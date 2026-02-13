/**
 * **regex-tui** - pkgx package
 *
 * @domain `github.com/vitor-mariano/regex-tui`
 * @version `0.6.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/vitor-mariano/regex-tui`
 * @buildDependencies `go.dev@=1.25.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomvitormarianoregextui
 * console.log(pkg.name)        // "regex-tui"
 * console.log(pkg.versions[0]) // "0.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/vitor-mariano/regex-tui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const regextuiPackage = {
  /**
   * The display name of this package.
   */
  name: 'regex-tui' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/vitor-mariano/regex-tui' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/vitor-mariano/regex-tui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/vitor-mariano/regex-tui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/vitor-mariano/regex-tui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/vitor-mariano/regex-tui' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@=1.25.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.0',
    '0.5.0',
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type RegextuiPackage = typeof regextuiPackage
