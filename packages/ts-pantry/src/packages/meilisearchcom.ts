/**
 * **meilisearch** - pkgx package
 *
 * @domain `meilisearch.com`
 *
 * @install `launchpad install meilisearch.com`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.meilisearchcom
 * console.log(pkg.name)        // "meilisearch"
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
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/meilisearch.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install meilisearch.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +meilisearch.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install meilisearch.com' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [] as const,
  aliases: [] as const,
}

export type MeilisearchcomPackage = typeof meilisearchcomPackage
