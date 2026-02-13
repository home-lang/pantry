/**
 * **elixir-lang** - Elixir is a dynamic, functional language for building scalable and maintainable applications
 *
 * @domain `elixir-lang.org`
 * @programs `elixir`, `elixirc`, `iex`, `mix`
 * @version `1.19.5` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install elixir-lang.org`
 * @homepage https://elixir-lang.org/
 * @dependencies `erlang.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.elixirlangorg
 * console.log(pkg.name)        // "elixir-lang"
 * console.log(pkg.description) // "Elixir is a dynamic, functional language for bu..."
 * console.log(pkg.programs)    // ["elixir", "elixirc", ...]
 * console.log(pkg.versions[0]) // "1.19.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/elixir-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const elixirlangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'elixir-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'elixir-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Elixir is a dynamic, functional language for building scalable and maintainable applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/elixir-lang.org/package.yml' as const,
  homepageUrl: 'https://elixir-lang.org/' as const,
  githubUrl: 'https://github.com/elixir-lang/elixir' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install elixir-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +elixir-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install elixir-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'elixir',
    'elixirc',
    'iex',
    'mix',
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
    '1.19.5',
    '1.19.4',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.4',
    '1.18.3',
    '1.18.2',
    '1.18.1',
    '1.18.0',
    '1.17.3',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.3',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.8',
    '1.15.7',
    '1.15.6',
    '1.15.5',
    '1.15.4',
    '1.15.3',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.5',
    '1.14.4',
  ] as const,
  aliases: [] as const,
}

export type ElixirlangorgPackage = typeof elixirlangorgPackage
