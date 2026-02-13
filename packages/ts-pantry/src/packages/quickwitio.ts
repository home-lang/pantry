/**
 * **quickwit** - Cloud-native search engine for observability. An open-source alternative to Datadog, Elasticsearch, Loki, and Tempo.
 *
 * @domain `quickwit.io`
 * @programs `quickwit`
 * @version `0.8.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install quickwit.io`
 * @homepage https://quickwit.io
 * @dependencies `protobuf.dev^25`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.quickwitio
 * console.log(pkg.name)        // "quickwit"
 * console.log(pkg.description) // "Cloud-native search engine for observability. A..."
 * console.log(pkg.programs)    // ["quickwit"]
 * console.log(pkg.versions[0]) // "0.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/quickwit-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const quickwitioPackage = {
  /**
   * The display name of this package.
   */
  name: 'quickwit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'quickwit.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Cloud-native search engine for observability. An open-source alternative to Datadog, Elasticsearch, Loki, and Tempo.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/quickwit.io/package.yml' as const,
  homepageUrl: 'https://quickwit.io' as const,
  githubUrl: 'https://github.com/quickwit-oss/quickwit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install quickwit.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +quickwit.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install quickwit.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'quickwit',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'protobuf.dev^25',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.5',
    '0.6.4',
  ] as const,
  aliases: [] as const,
}

export type QuickwitioPackage = typeof quickwitioPackage
