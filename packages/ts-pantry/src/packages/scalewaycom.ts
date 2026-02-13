/**
 * **scw** - Command Line Interface for Scaleway
 *
 * @domain `scaleway.com`
 * @programs `scw`
 * @version `2.51.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install scaleway.com`
 * @homepage https://www.scaleway.com/en/cli/
 * @buildDependencies `go.dev@~1.24.6` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.scalewaycom
 * console.log(pkg.name)        // "scw"
 * console.log(pkg.description) // "Command Line Interface for Scaleway"
 * console.log(pkg.programs)    // ["scw"]
 * console.log(pkg.versions[0]) // "2.51.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/scaleway-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scalewaycomPackage = {
  /**
   * The display name of this package.
   */
  name: 'scw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'scaleway.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command Line Interface for Scaleway' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/scaleway.com/package.yml' as const,
  homepageUrl: 'https://www.scaleway.com/en/cli/' as const,
  githubUrl: 'https://github.com/scaleway/scaleway-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install scaleway.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +scaleway.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install scaleway.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'scw',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.24.6',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.51.0',
    '2.50.0',
    '2.49.0',
    '2.48.0',
    '2.47.0',
    '2.46.0',
    '2.45.0',
    '2.44.0',
    '2.43.0',
    '2.42.0',
    '2.41.0',
    '2.40.0',
    '2.39.0',
    '2.38.0',
    '2.37.0',
    '2.36.0',
    '2.35.0',
    '2.34.0',
    '2.33.0',
    '2.32.1',
  ] as const,
  aliases: [] as const,
}

export type ScalewaycomPackage = typeof scalewaycomPackage
