/**
 * **oha** - Native HTTP load generator with paced requests and JSON reports.
 *
 * @domain `github.com/hatoo/oha`
 * @programs `oha`
 * @version `1.16.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/hatoo/oha`
 * @homepage https://github.com/hatoo/oha
 * @buildDependencies `curl.se`, `stedolan.github.io/jq^1`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomhatoooha
 * console.log(pkg.name)        // "oha"
 * console.log(pkg.description) // "Native HTTP load generator with paced requests ..."
 * console.log(pkg.programs)    // ["oha"]
 * console.log(pkg.versions[0]) // "1.16.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/hatoo/oha.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ohaPackage = {
  /**
  * The display name of this package.
  */
  name: 'oha' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/hatoo/oha' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Native HTTP load generator with paced requests and JSON reports.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://github.com/hatoo/oha' as const,
  githubUrl: 'https://github.com/hatoo/oha' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/hatoo/oha' as const,
  pantryInstallCommand: 'pantry install github.com/hatoo/oha' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'oha',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'stedolan.github.io/jq^1',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.7',
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type OhaPackage = typeof ohaPackage
