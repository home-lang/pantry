/**
 * **rebar3** - Erlang build tool that makes it easy to compile and test Erlang applications and releases.
 *
 * @domain `rebar3.org`
 * @programs `rebar3`
 * @version `3.27.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rebar3.org`
 * @homepage https://rebar3.org
 * @dependencies `erlang.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.rebar3org
 * console.log(pkg.name)        // "rebar3"
 * console.log(pkg.description) // "Erlang build tool that makes it easy to compile..."
 * console.log(pkg.programs)    // ["rebar3"]
 * console.log(pkg.versions[0]) // "3.27.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/rebar3-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install rebar3.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rebar3.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install rebar3.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.27.0',
    '3.26.0',
    '3.25.1',
    '3.25.0',
    '3.24.0',
    '3.23.0',
    '3.22.1',
    '3.22.0',
    '3.21.0',
    '3.20.0',
    '3.19.0',
    '3.18.0',
    '3.17.0',
    '3.16.1',
    '3.16.0',
    '3.15.2',
    '3.15.1',
    '3.15.0',
    '3.14.4',
    '3.14.3',
    '3.14.2',
    '3.14.1',
    '3.14.0',
    '3.13.3',
    '3.13.2',
    '3.13.1',
    '3.13.0',
    '3.12.0',
    '3.11.1',
    '3.11.0',
    '3.10.0',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.3',
    '3.5.2',
    '3.5.1',
  ] as const,
  aliases: [] as const,
}

export type Rebar3orgPackage = typeof rebar3orgPackage
