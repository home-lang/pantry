/**
 * **rover** - CLI for managing and maintaining data graphs with Apollo Studio
 *
 * @domain `apollographql.com/rover`
 * @programs `rover`
 * @version `0.37.2` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apollographql.com/rover`
 * @homepage https://www.apollographql.com/docs/rover/
 * @dependencies `openssl.org^1.1`, `zlib.net^1`, `libgit2.org~1.7 # links to libgit2.so.1.7`
 * @buildDependencies `linux:perl.org@^5` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apollographqlcomrover
 * console.log(pkg.name)        // "rover"
 * console.log(pkg.description) // "CLI for managing and maintaining data graphs wi..."
 * console.log(pkg.programs)    // ["rover"]
 * console.log(pkg.versions[0]) // "0.37.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apollographql-com/rover.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apollographqlcomroverPackage = {
  /**
   * The display name of this package.
   */
  name: 'rover' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apollographql.com/rover' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI for managing and maintaining data graphs with Apollo Studio' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apollographql.com/rover/package.yml' as const,
  homepageUrl: 'https://www.apollographql.com/docs/rover/' as const,
  githubUrl: 'https://github.com/apollographql/rover' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apollographql.com/rover' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apollographql.com/rover -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apollographql.com/rover' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rover',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:perl.org@^5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.37.2',
    '0.37.1',
    '0.37.0',
    '0.36.2',
    '0.36.1',
    '0.36.0',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.1',
    '0.32.0',
    '0.31.2',
    '0.31.1',
    '0.31.0',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.1',
    '0.28.0',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.1',
  ] as const,
  aliases: [] as const,
}

export type ApollographqlcomroverPackage = typeof apollographqlcomroverPackage
