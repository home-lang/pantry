/**
 * **atlas** - Manage your database schema as code
 *
 * @domain `atlasgo.io`
 * @programs `atlas`
 * @version `1.0.0` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install atlasgo.io`
 * @homepage https://atlasgo.io
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.atlasgoio
 * console.log(pkg.name)        // "atlas"
 * console.log(pkg.description) // "Manage your database schema as code"
 * console.log(pkg.programs)    // ["atlas"]
 * console.log(pkg.versions[0]) // "1.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/atlasgo-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const atlasgoioPackage = {
  /**
   * The display name of this package.
   */
  name: 'atlas' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'atlasgo.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Manage your database schema as code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/atlasgo.io/package.yml' as const,
  homepageUrl: 'https://atlasgo.io' as const,
  githubUrl: 'https://github.com/ariga/atlas' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install atlasgo.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +atlasgo.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install atlasgo.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'atlas',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.0',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
    '0.18.0',
    '0.17.0',
    '0.16.0',
    '0.15.0',
    '0.14.0',
  ] as const,
  aliases: [] as const,
}

export type AtlasgoioPackage = typeof atlasgoioPackage
