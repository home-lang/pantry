/**
 * **gql** - Very simple CLI for many GraphQL schemas in the cloud. Provides autocompletion for GraphQL queries
 *
 * @domain `graphqleditor.com/gql`
 * @programs `gql`
 * @version `0.1.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install graphqleditor.com/gql`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.graphqleditorcomgql
 * console.log(pkg.name)        // "gql"
 * console.log(pkg.description) // "Very simple CLI for many GraphQL schemas in the..."
 * console.log(pkg.programs)    // ["gql"]
 * console.log(pkg.versions[0]) // "0.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/graphqleditor-com/gql.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const graphqleditorcomgqlPackage = {
  /**
   * The display name of this package.
   */
  name: 'gql' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'graphqleditor.com/gql' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Very simple CLI for many GraphQL schemas in the cloud. Provides autocompletion for GraphQL queries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/graphqleditor.com/gql/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/graphql-editor/gql' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install graphqleditor.com/gql' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +graphqleditor.com/gql -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install graphqleditor.com/gql' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gql',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type GraphqleditorcomgqlPackage = typeof graphqleditorcomgqlPackage
