/**
 * **fselect** - Find files with SQL-like queries
 *
 * @domain `crates.io/fselect`
 * @programs `fselect`
 * @version `0.9.2` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/fselect`
 * @homepage https://fselect.rocks
 * @dependencies `openssl.org^1.1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiofselect
 * console.log(pkg.name)        // "fselect"
 * console.log(pkg.description) // "Find files with SQL-like queries"
 * console.log(pkg.programs)    // ["fselect"]
 * console.log(pkg.versions[0]) // "0.9.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/fselect.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiofselectPackage = {
  /**
   * The display name of this package.
   */
  name: 'fselect' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/fselect' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Find files with SQL-like queries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fselect/package.yml' as const,
  homepageUrl: 'https://fselect.rocks' as const,
  githubUrl: 'https://github.com/jhspetersson/fselect' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/fselect' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/fselect -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/fselect' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fselect',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.12',
    '0.8.11',
    '0.8.10',
    '0.8.9',
    '0.8.8',
    '0.8.6',
    '0.8.5',
    '0.8.4',
  ] as const,
  aliases: [] as const,
}

export type CratesiofselectPackage = typeof cratesiofselectPackage
