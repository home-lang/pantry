/**
 * **hasura** - Blazing fast, instant realtime GraphQL APIs on all your data with fine grained access control, also trigger webhooks on database events.
 *
 * @domain `hasura.io`
 * @programs `hasura`
 * @version `2.48.10` (59 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hasura.io`
 * @homepage https://hasura.io
 * @buildDependencies `go.dev@^1.16`, `npmjs.com@^8.19.4`, `gnu.org/coreutils`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hasuraio
 * console.log(pkg.name)        // "hasura"
 * console.log(pkg.description) // "Blazing fast, instant realtime GraphQL APIs on ..."
 * console.log(pkg.programs)    // ["hasura"]
 * console.log(pkg.versions[0]) // "2.48.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hasura-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hasuraioPackage = {
  /**
   * The display name of this package.
   */
  name: 'hasura' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hasura.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Blazing fast, instant realtime GraphQL APIs on all your data with fine grained access control, also trigger webhooks on database events.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hasura.io/package.yml' as const,
  homepageUrl: 'https://hasura.io' as const,
  githubUrl: 'https://github.com/hasura/graphql-engine' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hasura.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hasura.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hasura.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hasura',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.16',
    'npmjs.com@^8.19.4',
    'gnu.org/coreutils',
    'nodejs.org@^18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.48.10',
    '2.48.9',
    '2.48.6',
    '2.48.5',
    '2.48.4',
    '2.48.3',
    '2.48.2',
    '2.48.1',
    '2.48.0',
    '2.47.0',
    '2.46.0',
    '2.45.3',
    '2.45.2',
    '2.45.1',
    '2.45.0',
    '2.44.1',
    '2.44.0',
    '2.43.0',
    '2.42.0',
    '2.41.0',
    '2.40.3',
    '2.40.2',
    '2.40.1',
    '2.40.0',
    '2.39.2',
    '2.39.1',
    '2.39.0',
    '2.38.1',
    '2.38.0',
    '2.37.1',
    '2.37.0',
    '2.36.12',
    '2.36.10',
    '2.36.9',
    '2.36.8',
    '2.36.7',
    '2.36.6',
    '2.36.5',
    '2.36.4',
    '2.36.3',
    '2.36.2',
    '2.36.1',
    '2.36.0',
    '2.35.2',
    '2.35.1',
    '2.35.0',
    '2.34.0',
    '2.33.4',
    '2.33.3',
    '2.33.2',
    '2.33.1',
    '2.33.0',
    '2.32.1',
    '2.32.0',
    '2.31.0',
    '2.11.13',
    '2.11.12',
    '2.11.11',
    '2.11.10',
  ] as const,
  aliases: [] as const,
}

export type HasuraioPackage = typeof hasuraioPackage
