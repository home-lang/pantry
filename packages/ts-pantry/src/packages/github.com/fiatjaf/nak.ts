/**
 * **nak** - a command line tool for doing all things nostr
 *
 * @domain `github.com/fiatjaf/nak`
 * @programs `nak`
 * @version `0.18.1` (34 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/fiatjaf/nak`
 * @buildDependencies `go.dev@~1.25`, `linux:gnu.org/gcc`, `linux:github.com/libfuse/libfuse@2`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomfiatjafnak
 * console.log(pkg.name)        // "nak"
 * console.log(pkg.description) // "a command line tool for doing all things nostr"
 * console.log(pkg.programs)    // ["nak"]
 * console.log(pkg.versions[0]) // "0.18.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/fiatjaf/nak.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nakPackage = {
  /**
   * The display name of this package.
   */
  name: 'nak' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/fiatjaf/nak' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'a command line tool for doing all things nostr' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/fiatjaf/nak/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fiatjaf/nak' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/fiatjaf/nak' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/fiatjaf/nak -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/fiatjaf/nak' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nak',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@~1.25',
    'linux:gnu.org/gcc',
    'linux:github.com/libfuse/libfuse@2',
    'darwin:macfuse.github.io/v2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.18.1',
    '0.18.0',
    '0.17.9',
    '0.17.6',
    '0.17.4',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.16.2',
    '0.16.1',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.6',
    '0.12.0',
    '0.11.4',
    '0.11.3',
    '0.11.2',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type NakPackage = typeof nakPackage
