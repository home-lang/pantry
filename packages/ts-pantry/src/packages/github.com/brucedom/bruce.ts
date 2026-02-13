/**
 * **bruce** - Basic Runtime for Uniform Compute Environments
 *
 * @domain `github.com/brucedom/bruce`
 * @programs `bruce`
 * @version `1.4.8` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/brucedom/bruce`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombrucedombruce
 * console.log(pkg.name)        // "bruce"
 * console.log(pkg.description) // "Basic Runtime for Uniform Compute Environments"
 * console.log(pkg.programs)    // ["bruce"]
 * console.log(pkg.versions[0]) // "1.4.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/brucedom/bruce.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const brucePackage = {
  /**
   * The display name of this package.
   */
  name: 'bruce' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/brucedom/bruce' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Basic Runtime for Uniform Compute Environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/brucedom/bruce/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/brucedom/bruce' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/brucedom/bruce' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/brucedom/bruce -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/brucedom/bruce' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bruce',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.8',
    '1.2.8',
  ] as const,
  aliases: [] as const,
}

export type BrucePackage = typeof brucePackage
