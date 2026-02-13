/**
 * **erlang** - Programming language for highly scalable real-time systems
 *
 * @domain `erlang.org`
 * @programs `ct_run`, `dialyzer`, `epmd`, `erl`, `erlc`, ... (+4 more)
 * @version `28.3.1` (91 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install erlang.org`
 * @homepage https://www.erlang.org/
 * @dependencies `openssl.org^1.1`, `invisible-island.net/ncurses`
 * @buildDependencies `perl.org@>=5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.erlangorg
 * console.log(pkg.name)        // "erlang"
 * console.log(pkg.description) // "Programming language for highly scalable real-t..."
 * console.log(pkg.programs)    // ["ct_run", "dialyzer", ...]
 * console.log(pkg.versions[0]) // "28.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/erlang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const erlangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'erlang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'erlang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Programming language for highly scalable real-time systems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/erlang.org/package.yml' as const,
  homepageUrl: 'https://www.erlang.org/' as const,
  githubUrl: 'https://github.com/erlang/otp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install erlang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +erlang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install erlang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ct_run',
    'dialyzer',
    'epmd',
    'erl',
    'erlc',
    'escript',
    'run_erl',
    'to_erl',
    'typer',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'invisible-island.net/ncurses',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'perl.org@>=5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '28.3.1',
    '28.3.0',
    '28.2.0',
    '28.1.1',
    '28.1.0',
    '28.0.4',
    '28.0.3',
    '28.0.2',
    '28.0.1',
    '28.0.0',
    '27.3.4.6',
    '27.3.4.5',
    '27.3.4.4',
    '27.3.4.3',
    '27.3.4.2',
    '27.3.4.1',
    '27.3.4',
    '27.3.3',
    '27.3.2',
    '27.3.1',
    '27.3.0',
    '27.2.4',
    '27.2.3',
    '27.2.2',
    '27.2.1',
    '27.2.0',
    '27.1.3',
    '27.1.2',
    '27.1.1',
    '27.1.0',
    '27.0.1',
    '27.0.0',
    '26.2.5.9',
    '26.2.5.8',
    '26.2.5.7',
    '26.2.5.6',
    '26.2.5.5',
    '26.2.5.4',
    '26.2.5.3',
    '26.2.5.2',
    '26.2.5.16',
    '26.2.5.15',
    '26.2.5.14',
    '26.2.5.13',
    '26.2.5.12',
    '26.2.5.11',
    '26.2.5.10',
    '26.2.5.1',
    '26.2.5',
    '26.2.4',
    '26.2.2',
    '26.2.1',
    '26.2.0',
    '26.1.2',
    '26.1.1',
    '26.1.0',
    '26.0.2',
    '26.0.1',
    '26.0.0',
    '25.3.2.9',
    '25.3.2.8',
    '25.3.2.7',
    '25.3.2.6',
    '25.3.2.5',
    '25.3.2.4',
    '25.3.2.3',
    '25.3.2.21',
    '25.3.2.20',
    '25.3.2.2',
    '25.3.2.19',
    '25.3.2.18',
    '25.3.2.17',
    '25.3.2.16',
    '25.3.2.15',
    '25.3.2.14',
    '25.3.2.13',
    '25.3.2.12',
    '25.3.2.11',
    '25.3.2.10',
    '25.3.2.1',
    '25.3.2',
    '25.3.1',
    '25.3.0',
    '25.2.2',
    '24.3.4.17',
    '24.3.4.16',
    '24.3.4.15',
    '24.3.4.14',
    '24.3.4.13',
    '24.3.4.12',
    '24.3.4.11',
  ] as const,
  aliases: [] as const,
}

export type ErlangorgPackage = typeof erlangorgPackage
