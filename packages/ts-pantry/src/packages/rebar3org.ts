/**
 * **rebar3** - Erlang build tool that makes it easy to compile and test Erlang applications and releases.
 *
 * @domain `rebar3.org`
 * @programs `rebar3`
 * @version `3.26.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rebar3.org`
 * @homepage https://rebar3.org
 * @dependencies `erlang.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rebar3org
 * console.log(pkg.name)        // "rebar3"
 * console.log(pkg.description) // "Erlang build tool that makes it easy to compile..."
 * console.log(pkg.programs)    // ["rebar3"]
 * console.log(pkg.versions[0]) // "3.26.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rebar3-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rebar3orgPackage = {
  /**
   * The display name of this package.
   */
  name: 'rebar3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rebar3.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Erlang build tool that makes it easy to compile and test Erlang applications and releases.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rebar3.org/package.yml' as const,
  homepageUrl: 'https://rebar3.org' as const,
  githubUrl: 'https://github.com/erlang/rebar3' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rebar3.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rebar3.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rebar3.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rebar3',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'erlang.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.26.0',
    '3.25.1',
    '3.25.0',
    '3.24.0',
    '3.23.0',
  ] as const,
  aliases: [] as const,
}

export type Rebar3orgPackage = typeof rebar3orgPackage
