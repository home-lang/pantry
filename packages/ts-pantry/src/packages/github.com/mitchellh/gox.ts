/**
 * **gox** - A dead simple, no frills Go cross compile tool
 *
 * @domain `github.com/mitchellh/gox`
 * @programs `gox`
 * @version `1.0.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mitchellh/gox`
 * @dependencies `go.dev`
 * @buildDependencies `gnu.org/wget`, `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommitchellhgox
 * console.log(pkg.name)        // "gox"
 * console.log(pkg.description) // "A dead simple, no frills Go cross compile tool"
 * console.log(pkg.programs)    // ["gox"]
 * console.log(pkg.versions[0]) // "1.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mitchellh/gox.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const goxPackage = {
  /**
   * The display name of this package.
   */
  name: 'gox' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mitchellh/gox' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A dead simple, no frills Go cross compile tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mitchellh/gox/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mitchellh/gox' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mitchellh/gox' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mitchellh/gox -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mitchellh/gox' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gox',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'go.dev',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.1',
  ] as const,
  aliases: [] as const,
}

export type GoxPackage = typeof goxPackage
