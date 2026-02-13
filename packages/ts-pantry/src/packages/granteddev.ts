/**
 * **granted** - The easiest way to access your cloud.
 *
 * @domain `granted.dev`
 * @programs `granted`
 * @version `0.38.0` (38 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install granted.dev`
 * @homepage https://granted.dev
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.granteddev
 * console.log(pkg.name)        // "granted"
 * console.log(pkg.description) // "The easiest way to access your cloud."
 * console.log(pkg.programs)    // ["granted"]
 * console.log(pkg.versions[0]) // "0.38.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/granted-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const granteddevPackage = {
  /**
   * The display name of this package.
   */
  name: 'granted' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'granted.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The easiest way to access your cloud.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/granted.dev/package.yml' as const,
  homepageUrl: 'https://granted.dev' as const,
  githubUrl: 'https://github.com/common-fate/granted' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install granted.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +granted.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install granted.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'granted',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.38.0',
    '0.37.0',
    '0.36.3',
    '0.36.2',
    '0.36.1',
    '0.36.0',
    '0.35.2',
    '0.35.1',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.2',
    '0.31.1',
    '0.31.0',
    '0.30.0',
    '0.29.3',
    '0.29.2',
    '0.29.1',
    '0.29.0',
    '0.28.0',
    '0.27.5',
    '0.27.4',
    '0.27.3',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.0',
    '0.21.1',
  ] as const,
  aliases: [] as const,
}

export type GranteddevPackage = typeof granteddevPackage
