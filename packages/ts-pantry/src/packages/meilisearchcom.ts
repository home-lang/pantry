/**
 * **meilisearch** - A lightning-fast search engine
 *
 * @domain `meilisearch.com`
 * @programs `meilisearch`
 * @version `1.35.1` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install meilisearch.com`
 * @homepage https://www.meilisearch.com/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.meilisearchcom
 * console.log(pkg.name)        // "meilisearch"
 * console.log(pkg.description) // "A lightning-fast search engine"
 * console.log(pkg.programs)    // ["meilisearch"]
 * console.log(pkg.versions[0]) // "1.35.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/meilisearch-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const meilisearchcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'meilisearch' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'meilisearch.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A lightning-fast search engine' as const,
  packageYmlUrl: 'https://github.com/stacksjs/pantry/tree/main/packages/ts-pantry/src/pantry/meilisearch.com/package.yml' as const,
  homepageUrl: 'https://www.meilisearch.com/' as const,
  githubUrl: 'https://github.com/meilisearch/meilisearch' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install meilisearch.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +meilisearch.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install meilisearch.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'meilisearch',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.35.1',
    '1.35.0',
    '1.34.3',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.1',
    '1.33.0',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.0',
    '1.30.1',
    '1.30.0',
    '1.29.0',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.1',
  ] as const,
  aliases: [] as const,
}

export type MeilisearchcomPackage = typeof meilisearchcomPackage
