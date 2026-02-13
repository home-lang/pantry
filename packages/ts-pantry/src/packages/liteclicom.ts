/**
 * **litecli** - CLI for SQLite Databases with auto-completion and syntax highlighting
 *
 * @domain `litecli.com`
 * @programs `litecli`
 * @version `1.17.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install litecli.com`
 * @homepage https://litecli.com
 * @dependencies `pkgx.sh^1`, `sqlite.org^3.45`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.liteclicom
 * console.log(pkg.name)        // "litecli"
 * console.log(pkg.description) // "CLI for SQLite Databases with auto-completion a..."
 * console.log(pkg.programs)    // ["litecli"]
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/litecli-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const liteclicomPackage = {
  /**
   * The display name of this package.
   */
  name: 'litecli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'litecli.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI for SQLite Databases with auto-completion and syntax highlighting' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/litecli.com/package.yml' as const,
  homepageUrl: 'https://litecli.com' as const,
  githubUrl: 'https://github.com/dbcli/litecli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install litecli.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +litecli.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install litecli.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'litecli',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
    'sqlite.org^3.45',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.4',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.2',
    '1.13.0',
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.11.1',
    '1.11.0',
    '1.10.1',
    '1.10.0',
  ] as const,
  aliases: [] as const,
}

export type LiteclicomPackage = typeof liteclicomPackage
