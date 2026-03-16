/**
 * **meilisearch** - pkgx package
 *
 * @domain `meilisearch.com`
 * @programs `meilisearch`
 *
 * @install `pantry install meilisearch.com`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.meilisearchcom
 * console.log(pkg.name)        // "meilisearch"
 * console.log(pkg.programs)    // ["meilisearch"]
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/meilisearch-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/meilisearch.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install meilisearch.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +meilisearch.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install meilisearch.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'meilisearch',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [] as const,
  aliases: [] as const,
}

export type MeilisearchcomPackage = typeof meilisearchcomPackage
