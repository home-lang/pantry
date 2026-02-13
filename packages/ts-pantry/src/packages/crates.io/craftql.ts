/**
 * **craftql** - A CLI tool to visualize GraphQL schemas and to output a graph data structure as a graphviz .dot format
 *
 * @domain `crates.io/craftql`
 * @programs `craftql`
 * @version `0.2.20` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/craftql`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocraftql
 * console.log(pkg.name)        // "craftql"
 * console.log(pkg.description) // "A CLI tool to visualize GraphQL schemas and to ..."
 * console.log(pkg.programs)    // ["craftql"]
 * console.log(pkg.versions[0]) // "0.2.20" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/craftql.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocraftqlPackage = {
  /**
   * The display name of this package.
   */
  name: 'craftql' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/craftql' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A CLI tool to visualize GraphQL schemas and to output a graph data structure as a graphviz .dot format' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/craftql/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/yamafaktory/craftql' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/craftql' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/craftql -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/craftql' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'craftql',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.20',
  ] as const,
  aliases: [] as const,
}

export type CratesiocraftqlPackage = typeof cratesiocraftqlPackage
