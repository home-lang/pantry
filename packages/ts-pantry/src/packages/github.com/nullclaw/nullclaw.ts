/**
 * **nullclaw** - pkgx package
 *
 * @domain `github.com/nullclaw/nullclaw`
 * @programs `nullclaw`, `nullclaw-init`
 * @version `2026.3.18` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/nullclaw/nullclaw`
 * @dependencies `github.com/mikefarah/yq`, `stedolan.github.io/jq`, `gnu.org/sed`
 * @buildDependencies `curl.se`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomnullclawnullclaw
 * console.log(pkg.name)        // "nullclaw"
 * console.log(pkg.programs)    // ["nullclaw", "nullclaw-init"]
 * console.log(pkg.versions[0]) // "2026.3.18" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/nullclaw/nullclaw.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const nullclawPackage = {
  /**
  * The display name of this package.
  */
  name: 'nullclaw' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/nullclaw/nullclaw' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nullclaw/nullclaw/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/nullclaw/nullclaw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nullclaw/nullclaw -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/nullclaw/nullclaw' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'nullclaw',
    'nullclaw-init',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/mikefarah/yq',
    'stedolan.github.io/jq',
    'gnu.org/sed',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.3.18',
    '2026.3.17',
    '2026.3.15',
    '2026.3.14',
    '2026.3.13',
    '2026.3.12',
    '2026.3.11',
    '2026.3.10',
    '2026.3.8',
    '2026.3.7',
    '2026.3.5',
    '2026.3.4',
    '2026.3.3',
    '2026.3.2',
    '2026.3.1',
    '2026.2.26',
    '2026.2.25',
  ] as const,
  aliases: [] as const,
}

export type NullclawPackage = typeof nullclawPackage
