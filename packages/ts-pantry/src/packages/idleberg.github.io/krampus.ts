/**
 * **krampus** - Command-line tool to kill one or more processes by port number
 *
 * @domain `idleberg.github.io/krampus`
 * @programs `krampus`
 * @version `0.2.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install idleberg.github.io/krampus`
 * @homepage https://pkg.go.dev/github.com/idleberg/krampus
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.idleberggithubiokrampus
 * console.log(pkg.name)        // "krampus"
 * console.log(pkg.description) // "Command-line tool to kill one or more processes..."
 * console.log(pkg.programs)    // ["krampus"]
 * console.log(pkg.versions[0]) // "0.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/idleberg-github-io/krampus.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const idleberggithubiokrampusPackage = {
  /**
   * The display name of this package.
   */
  name: 'krampus' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'idleberg.github.io/krampus' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line tool to kill one or more processes by port number' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/idleberg.github.io/krampus/package.yml' as const,
  homepageUrl: 'https://pkg.go.dev/github.com/idleberg/krampus' as const,
  githubUrl: 'https://github.com/idleberg/krampus' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install idleberg.github.io/krampus' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +idleberg.github.io/krampus -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install idleberg.github.io/krampus' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'krampus',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.1',
    '0.2.0',
  ] as const,
  aliases: [] as const,
}

export type IdleberggithubiokrampusPackage = typeof idleberggithubiokrampusPackage
