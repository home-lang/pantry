/**
 * **factotum** - A system to programmatically run data pipelines
 *
 * @domain `github.com/snowplow/factotum`
 * @programs `factotum`
 * @version `0.7.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/snowplow/factotum`
 * @homepage http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsnowplowfactotum
 * console.log(pkg.name)        // "factotum"
 * console.log(pkg.description) // "A system to programmatically run data pipelines"
 * console.log(pkg.programs)    // ["factotum"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/snowplow/factotum.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const factotumPackage = {
  /**
   * The display name of this package.
   */
  name: 'factotum' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/snowplow/factotum' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A system to programmatically run data pipelines' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/snowplow/factotum/package.yml' as const,
  homepageUrl: 'http://snowplowanalytics.com/blog/2016/04/09/introducing-factotum-data-pipeline-runner/' as const,
  githubUrl: 'https://github.com/snowplow/factotum' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/snowplow/factotum' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/snowplow/factotum -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/snowplow/factotum' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'factotum',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
    '0.6.1',
    '0.6.0',
  ] as const,
  aliases: [] as const,
}

export type FactotumPackage = typeof factotumPackage
