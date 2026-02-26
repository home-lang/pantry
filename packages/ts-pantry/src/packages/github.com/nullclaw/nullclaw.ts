/**
 * **nullclaw** - pkgx package
 *
 * @domain `github.com/nullclaw/nullclaw`
 * @version `2026.2.25` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nullclaw/nullclaw`
 * @dependencies `github.com/mikefarah/yq`, `stedolan.github.io/jq`, `gnu.org/sed`
 * @buildDependencies `curl.se`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnullclawnullclaw
 * console.log(pkg.name)        // "nullclaw"
 * console.log(pkg.versions[0]) // "2026.2.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nullclaw/nullclaw.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/nullclaw/nullclaw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nullclaw/nullclaw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nullclaw/nullclaw' as const,
  programs: [] as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.2.25',
  ] as const,
  aliases: [] as const,
}

export type NullclawPackage = typeof nullclawPackage
