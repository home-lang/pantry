/**
 * **plakar** - pkgx package
 *
 * @domain `plakar.io`
 * @version `1.0.6` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install plakar.io`
 * @buildDependencies `go.dev@^1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.plakario
 * console.log(pkg.name)        // "plakar"
 * console.log(pkg.versions[0]) // "1.0.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/plakar-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const plakarioPackage = {
  /**
  * The display name of this package.
  */
  name: 'plakar' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'plakar.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/plakar.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install plakar.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +plakar.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install plakar.io' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.23',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
  ] as const,
  aliases: [] as const,
}

export type PlakarioPackage = typeof plakarioPackage
