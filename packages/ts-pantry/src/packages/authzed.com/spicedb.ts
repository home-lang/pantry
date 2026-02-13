/**
 * **spicedb** - Open Source, Google Zanzibar-inspired database for scalably storing and querying fine-grained authorization data
 *
 * @domain `authzed.com/spicedb`
 * @programs `spicedb`
 * @version `1.48.0` (35 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install authzed.com/spicedb`
 * @homepage https://authzed.com/docs
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.authzedcomspicedb
 * console.log(pkg.name)        // "spicedb"
 * console.log(pkg.description) // "Open Source, Google Zanzibar-inspired database ..."
 * console.log(pkg.programs)    // ["spicedb"]
 * console.log(pkg.versions[0]) // "1.48.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/authzed-com/spicedb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const authzedcomspicedbPackage = {
  /**
   * The display name of this package.
   */
  name: 'spicedb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'authzed.com/spicedb' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open Source, Google Zanzibar-inspired database for scalably storing and querying fine-grained authorization data' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/authzed.com/spicedb/package.yml' as const,
  homepageUrl: 'https://authzed.com/docs' as const,
  githubUrl: 'https://github.com/authzed/spicedb' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install authzed.com/spicedb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +authzed.com/spicedb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install authzed.com/spicedb' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'spicedb',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.48.0',
    '1.47.1',
    '1.46.2',
    '1.46.1',
    '1.46.0',
    '1.45.4',
    '1.45.3',
    '1.45.2',
    '1.45.1',
    '1.45.0',
    '1.44.4',
    '1.44.3',
    '1.44.2',
    '1.44.0',
    '1.43.0',
    '1.42.1',
    '1.42.0',
    '1.41.0',
    '1.40.1',
    '1.40.0',
    '1.39.1',
    '1.39.0',
    '1.38.1',
    '1.38.0',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.3',
    '1.35.2',
    '1.35.1',
    '1.35.0',
    '1.34.0',
  ] as const,
  aliases: [] as const,
}

export type AuthzedcomspicedbPackage = typeof authzedcomspicedbPackage
