/**
 * **jsonlint** - A JSON parser and validator with a CLI.
 *
 * @domain `github.com/zaach/jsonlint`
 * @programs `jsonlint`
 * @version `1.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/zaach/jsonlint`
 * @homepage http://zaach.github.com/jsonlint/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com@^10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomzaachjsonlint
 * console.log(pkg.name)        // "jsonlint"
 * console.log(pkg.description) // "A JSON parser and validator with a CLI."
 * console.log(pkg.programs)    // ["jsonlint"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/zaach/jsonlint.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jsonlintPackage = {
  /**
   * The display name of this package.
   */
  name: 'jsonlint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/zaach/jsonlint' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A JSON parser and validator with a CLI.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zaach/jsonlint/package.yml' as const,
  homepageUrl: 'http://zaach.github.com/jsonlint/' as const,
  githubUrl: 'https://github.com/zaach/jsonlint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/zaach/jsonlint' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/zaach/jsonlint -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/zaach/jsonlint' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jsonlint',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com@^10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.0',
  ] as const,
  aliases: [] as const,
}

export type JsonlintPackage = typeof jsonlintPackage
