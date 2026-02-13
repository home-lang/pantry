/**
 * **postgrest** - Serves a fully RESTful API from any existing PostgreSQL database
 *
 * @domain `postgrest.org`
 * @programs `postgrest`
 * @version `14.3.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install postgrest.org`
 * @homepage https://postgrest.org
 * @dependencies `postgresql.org/libpq@17`, `zlib.net~1.3`, `gnu.org/gcc/libstdcxx@14`, ... (+1 more)
 * @buildDependencies `haskell.org@~9.8`, `haskell.org/cabal@^3`, `linux:gnu.org/gcc`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.postgrestorg
 * console.log(pkg.name)        // "postgrest"
 * console.log(pkg.description) // "Serves a fully RESTful API from any existing Po..."
 * console.log(pkg.programs)    // ["postgrest"]
 * console.log(pkg.versions[0]) // "14.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/postgrest-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const postgrestorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'postgrest' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'postgrest.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Serves a fully RESTful API from any existing PostgreSQL database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/postgrest.org/package.yml' as const,
  homepageUrl: 'https://postgrest.org' as const,
  githubUrl: 'https://github.com/PostgREST/postgrest' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install postgrest.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +postgrest.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install postgrest.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'postgrest',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'postgresql.org/libpq@17',
    'zlib.net~1.3',
    'gnu.org/gcc/libstdcxx@14',
    'gnome.org/libxml2~2.13 # 2.14 changes library api version',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'haskell.org@~9.8',
    'haskell.org/cabal@^3',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '14.3.0',
    '14.2.0',
    '14.1.0',
    '14.0.0',
    '13.0.8',
    '13.0.7',
    '13.0.6',
    '13.0.5',
    '13.0.4',
    '13.0.3',
    '13.0.2',
    '13.0.1',
    '13.0.0',
    '12.2.12',
    '12.2.11',
    '12.2.10',
    '12.2.9',
    '12.2.8',
    '12.2.7',
    '12.2.6',
    '12.2.5',
    '12.2.4',
    '12.2.3',
  ] as const,
  aliases: [] as const,
}

export type PostgrestorgPackage = typeof postgrestorgPackage
